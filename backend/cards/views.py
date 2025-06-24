from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
import os
from django.conf import settings
from django.db.models import Avg, Count, Q
from datetime import timedelta

from .models import Card, CardReview, Deck, LearningSession, User
from .srs import evaluate_review, get_cards_for_review
from .serializers import (
    CardReviewSerializer,
    CardSerializer,
    DeckDetailSerializer,
    DeckSerializer,
    LearningSessionSerializer,
    UserSerializer,
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows only the owner of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class IsDeckOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows only the owner of the deck to edit cards.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.deck.owner == request.user

class AvatarViewSet(APIView):
    """
    Avatar upload and delete operations
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Upload avatar for current user
        """
        if 'avatar' not in request.FILES:
            return Response({'error': 'Kein Avatar-Bild gefunden'}, status=400)
        
        avatar_file = request.FILES['avatar']
        
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if avatar_file.content_type not in allowed_types:
            return Response({
                'error': 'Nur JPEG, PNG und GIF Dateien sind erlaubt'
            }, status=400)
        
        if avatar_file.size > 5 * 1024 * 1024:
            return Response({
                'error': 'Datei ist zu groß. Maximum 5MB erlaubt.'
            }, status=400)
        
        try:
            user = request.user
            
            avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars', user.username)
            os.makedirs(avatar_dir, exist_ok=True)
            
            if user.avatar:
                user.avatar.delete(save=False)
            
            user.avatar = avatar_file
            user.save()
            
            return Response({
                'message': 'Avatar erfolgreich hochgeladen',
                'avatar_url': user.avatar_url
            })
        except Exception as e:
            return Response({
                'error': f'Fehler beim Hochladen: {str(e)}'
            }, status=500)

    def delete(self, request):
        """
        Delete avatar for current user
        """
        try:
            user = request.user
            if user.avatar:
                user.avatar.delete(save=False)
                user.avatar = None
                user.save()
                
                avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars', user.username)
                if os.path.exists(avatar_dir) and not os.listdir(avatar_dir):
                    os.rmdir(avatar_dir)
                
                return Response({
                    'message': 'Avatar erfolgreich gelöscht'
                })
            else:
                return Response({
                    'error': 'Kein Avatar vorhanden'
                }, status=404)
        except Exception as e:
            return Response({
                'error': f'Fehler beim Löschen: {str(e)}'
            }, status=500)

class UserViewSet(viewsets.ViewSet):
    """
    User-ViewSet
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    def list(self, request):
        """Get current user"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get current user by ID"""
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def get_serializer(self, *args, **kwargs):
        return UserSerializer(*args, **kwargs)

class LearningStatsView(APIView):
    """
    Learning statistics view for SRS dashboard
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get SRS-specific learning statistics for the current user
        """
        try:
            user = request.user
            now = timezone.now()
            
            try:
                due_cards_count = Card.objects.filter(
                    deck__owner=user
                ).filter(
                    Q(next_review__lte=now) | Q(next_review__isnull=True)
                ).count()                    
            except Exception as e:
                due_cards_count = 0
            
            try:
                learning_streak = 0
                current_date = now.date()
                
                for i in range(30):
                    check_date = current_date - timedelta(days=i)
                    has_session = LearningSession.objects.filter(
                        user=user,
                        status='completed',
                        started_at__date=check_date
                    ).exists()
                    
                    if has_session:
                        learning_streak += 1
                    else:
                        break
            except Exception as e:
                print(f"Error calculating learning streak: {e}")
                learning_streak = 0
            
            try:
                recent_reviews = CardReview.objects.filter(
                    session__user=user
                ).order_by('-created_at')[:50]
                
                if recent_reviews.exists():
                    total_time = 0
                    count = 0
                    for review in recent_reviews:
                        time_in_seconds = review.time_taken / 1000 if review.time_taken > 1000 else review.time_taken
                        total_time += time_in_seconds
                        count += 1
                    
                    average_response_time = total_time / count if count > 0 else 0
                else:
                    average_response_time = 0
            except Exception as e:
                print(f"Error calculating average response time: {e}")
                average_response_time = 0
            
            try:
                recent_10_reviews = CardReview.objects.filter(
                    session__user=user
                ).order_by('-created_at')[:10]
                
                
                if recent_10_reviews.exists():
                    reviews_list = list(recent_10_reviews)
                    correct_count = sum(1 for review in reviews_list if review.is_correct)
                    total_count = len(reviews_list)
                    recent_accuracy = (correct_count / total_count) * 100
                    
                else:
                    recent_accuracy = 0
            except Exception as e:
                print(f"Error calculating recent accuracy: {e}")
                recent_accuracy = 0
            
            return Response({
                'due_cards_count': due_cards_count,
                'learning_streak': learning_streak,
                'average_response_time': average_response_time,
                'recent_accuracy': recent_accuracy
            })
        except Exception as e:
            print(f"Error in LearningStatsView: {e}")
            return Response({
                'due_cards_count': 0,
                'learning_streak': 0,
                'average_response_time': 0,
                'recent_accuracy': 0
            }, status=500)

class DeckViewSet(viewsets.ModelViewSet):
    """
    Deck-ViewSet
    """
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['is_public']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']

    def get_queryset(self):
        own_decks = Deck.objects.filter(owner=self.request.user)
        public_decks = Deck.objects.filter(is_public=True)
        return own_decks | public_decks

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DeckDetailSerializer
        return DeckSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def deck_stats(self, request, pk=None):
        """
        Get SRS-specific statistics for a deck
        """
        deck = self.get_object()
        now = timezone.now()
        
        due_cards_count = Card.objects.filter(
            deck=deck
        ).filter(
            Q(next_review__lte=now) | Q(next_review__isnull=True)
        ).count()
        
        cards_with_ease = Card.objects.filter(deck=deck, ease_factor__gt=0)
        if cards_with_ease.exists():
            average_ease_factor = cards_with_ease.aggregate(
                avg_ease=Avg('ease_factor')
            )['avg_ease']
        else:
            recent_reviews = CardReview.objects.filter(
                session__user=request.user,
                session__deck=deck
            ).order_by('-created_at')[:20]
            
            if recent_reviews.exists():
                total_time = 0
                count = 0
                for review in recent_reviews:
                    time_in_seconds = review.time_taken / 1000 if review.time_taken > 1000 else review.time_taken
                    total_time += time_in_seconds
                    count += 1
                
                avg_response_time = total_time / count if count > 0 else 0
                
                if avg_response_time <= 10:
                    average_ease_factor = 3.5  # Very easy (fast responses)
                elif avg_response_time <= 20:
                    average_ease_factor = 3.0  # Easy
                elif avg_response_time <= 35:
                    average_ease_factor = 2.5  # Medium
                elif avg_response_time <= 60:
                    average_ease_factor = 2.0  # Hard
                else:
                    average_ease_factor = 1.5  # Very hard (slow responses)
            else:
                average_ease_factor = 2.5  # Default
        
        last_session = LearningSession.objects.filter(
            user=request.user,
            deck=deck,
            status='completed'
        ).order_by('-started_at').first()
        
        last_session_date = None
        last_session_accuracy = None
        
        if last_session:
            last_session_date = last_session.started_at.isoformat()
            
            session_reviews = CardReview.objects.filter(session=last_session)
            if session_reviews.exists():
                correct_count = session_reviews.filter(is_correct=True).count()
                last_session_accuracy = (correct_count / session_reviews.count()) * 100
        
        next_review_card = Card.objects.filter(
            deck=deck,
            next_review__isnull=False
        ).order_by('next_review').first()
        
        next_review_date = next_review_card.next_review.isoformat() if next_review_card else None
        
        return Response({
            'id': deck.id,
            'due_cards_count': due_cards_count,
            'average_ease_factor': average_ease_factor,
            'last_session_date': last_session_date,
            'last_session_accuracy': last_session_accuracy,
            'next_review_date': next_review_date
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get SRS statistics for all user's decks
        """
        user = request.user
        now = timezone.now()
        
        user_decks = Deck.objects.filter(owner=user)
        deck_stats = []
        
        for deck in user_decks:
            due_cards_count = Card.objects.filter(
                deck=deck
            ).filter(
                Q(next_review__lte=now) | Q(next_review__isnull=True)
            ).count()
            
            cards_with_ease = Card.objects.filter(deck=deck, ease_factor__gt=0)
            if cards_with_ease.exists():
                average_ease_factor = cards_with_ease.aggregate(
                    avg_ease=Avg('ease_factor')
                )['avg_ease']
            else:
                recent_reviews = CardReview.objects.filter(
                    session__user=request.user,
                    session__deck=deck
                ).order_by('-created_at')[:20]
                
                if recent_reviews.exists():
                    total_time = 0
                    count = 0
                    for review in recent_reviews:
                        time_in_seconds = review.time_taken / 1000 if review.time_taken > 1000 else review.time_taken
                        total_time += time_in_seconds
                        count += 1
                    
                    avg_response_time = total_time / count if count > 0 else 0
                    
                    if avg_response_time <= 10:
                        average_ease_factor = 3.5  # Very easy (fast responses)
                    elif avg_response_time <= 20:
                        average_ease_factor = 3.0  # Easy
                    elif avg_response_time <= 35:
                        average_ease_factor = 2.5  # Medium
                    elif avg_response_time <= 60:
                        average_ease_factor = 2.0  # Hard
                    else:
                        average_ease_factor = 1.5  # Very hard (slow responses)
                else:
                    average_ease_factor = 2.5  # Default
            
            last_session = LearningSession.objects.filter(
                user=user,
                deck=deck,
                status='completed'
            ).order_by('-started_at').first()
            
            last_session_date = None
            last_session_accuracy = None
            
            if last_session:
                last_session_date = last_session.started_at.isoformat()
                
                session_reviews = CardReview.objects.filter(session=last_session)
                if session_reviews.exists():
                    correct_count = session_reviews.filter(is_correct=True).count()
                    last_session_accuracy = (correct_count / session_reviews.count()) * 100
            
            next_review_card = Card.objects.filter(
                deck=deck,
                next_review__isnull=False
            ).order_by('next_review').first()
            
            next_review_date = next_review_card.next_review.isoformat() if next_review_card else None
            
            deck_stats.append({
                'id': deck.id,
                'due_cards_count': due_cards_count,
                'average_ease_factor': average_ease_factor,
                'last_session_date': last_session_date,
                'last_session_accuracy': last_session_accuracy,
                'next_review_date': next_review_date
            })
        
        return Response(deck_stats)

class CardViewSet(viewsets.ModelViewSet):
    """
    Card-ViewSet
    """
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated, IsDeckOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['deck']
    search_fields = ['front', 'back']

    def get_queryset(self):
        own_cards = Card.objects.filter(deck__owner=self.request.user)
        public_cards = Card.objects.filter(deck__is_public=True)
        return own_cards | public_cards

    def perform_create(self, serializer):
        deck = serializer.validated_data['deck']
        if deck.owner != self.request.user:
            raise permissions.PermissionDenied(
                "Du bist nicht der Besitzer dieses Decks."
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.deck.owner != self.request.user:
            raise permissions.PermissionDenied(
                "Du bist nicht der Besitzer dieser Karte."
            )
        instance.delete()

class LearningSessionViewSet(viewsets.ModelViewSet):
    """
    Learning session viewset
    """
    serializer_class = LearningSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'deck']
    ordering_fields = ['started_at', 'ended_at']
    ordering = ['-started_at']

    def get_queryset(self):
        return LearningSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        deck = serializer.validated_data['deck']
        if deck.owner != self.request.user and not deck.is_public:
            raise permissions.PermissionDenied(
                "Du hast keine Berechtigung für dieses Deck."
            )
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def cards(self, request, pk=None):
        """
        Get the list of cards for a learning session.
        Uses the SRS algorithm to select and order cards.
        """
        session = self.get_object()
        if session.status != 'active':
            return Response({'error': 'Diese Lernsession ist nicht aktiv.'}, status=status.HTTP_400_BAD_REQUEST)
        
        cards_for_review = get_cards_for_review(session.deck, limit=20)
        
        serializer = CardSerializer(cards_for_review, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status != 'active':
            return Response({'error': 'Session ist bereits abgeschlossen.'}, status=400)
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()
        return Response(self.get_serializer(session).data)

class CardReviewViewSet(viewsets.ModelViewSet):
    """
    Card review viewset
    """
    serializer_class = CardReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_correct']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return CardReview.objects.filter(session__user=self.request.user)

    def perform_create(self, serializer):
        session = serializer.validated_data['session']
        if session.user != self.request.user:
            raise permissions.PermissionDenied(
                "Du bist nicht der Besitzer dieser Session."
            )
        
        review = serializer.save()
        evaluate_review(
            card=review.card,
            is_correct=review.is_correct,
            taken_time=float(review.time_taken)
        )
    