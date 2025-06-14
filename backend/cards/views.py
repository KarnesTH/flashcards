from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Badge, Card, CardReview, Deck, LearningSession, Tag, UserBadge
from .serializers import (
    BadgeSerializer,
    CardReviewSerializer,
    CardSerializer,
    DeckDetailSerializer,
    DeckSerializer,
    LearningSessionSerializer,
    TagSerializer,
    UserBadgeSerializer,
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

class DeckViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Deck-Models
    """
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['is_public', 'tags']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']

    def get_queryset(self):
        filtered_decks_by_owner = Deck.objects.filter(owner=self.request.user)
        filtered_decks_by_public = Deck.objects.filter(is_public=True)
        return filtered_decks_by_owner | filtered_decks_by_public

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DeckDetailSerializer
        return DeckSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Card-Models
    """
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['deck']
    search_fields = ['front', 'back']

    def get_queryset(self):
        filtered_cards_by_owner = Card.objects.filter(deck__owner=self.request.user)
        filtered_cards_by_public = Card.objects.filter(deck__is_public=True)
        return filtered_cards_by_owner | filtered_cards_by_public

    def perform_create(self, serializer):
        deck = serializer.validated_data['deck']
        if deck.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You are not the owner of this deck."
            )
        serializer.save()

class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag-Models
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class LearningSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LearningSession-Models
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
                "You do not have permission to access this deck."
            )
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status != 'active':
            return Response({'error': 'Session is already completed.'}, status=400)
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()
        return Response(self.get_serializer(session).data)

class CardReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CardReview-Models
    """
    serializer_class = CardReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_correct', 'difficulty_rating']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return CardReview.objects.filter(session__user=self.request.user)

    def perform_create(self, serializer):
        session = serializer.validated_data['session']
        if session.user != self.request.user:
            raise permissions.PermissionDenied(
                "You are not the owner of this session."
            )
        serializer.save()

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Badge-Models (read only)
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for UserBadge-Models (read only)
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['badge']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)

class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)