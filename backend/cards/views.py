from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Card, CardReview, Deck, LearningSession, User
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

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    User-ViewSet (read-only)
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

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
        serializer.save()
    