from djoser.serializers import UserCreateSerializer
from rest_framework import serializers

from .models import Card, CardReview, Deck, LearningSession, User


class UserCreateSerializer(UserCreateSerializer):
    """
    User create serializer
    """
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer
    """
    total_cards_created = serializers.ReadOnlyField()
    total_decks_created = serializers.ReadOnlyField()
    total_learning_sessions = serializers.ReadOnlyField()
    total_cards_reviewed = serializers.ReadOnlyField()
    total_correct_answers = serializers.ReadOnlyField()
    learning_accuracy = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'bio', 'last_active', 'total_cards_created', 'total_decks_created',
            'total_learning_sessions', 'total_cards_reviewed', 'total_correct_answers',
            'learning_accuracy'
        ]
        read_only_fields = [
            'id', 'last_active', 'total_cards_created', 'total_decks_created',
            'total_learning_sessions', 'total_cards_reviewed', 'total_correct_answers',
            'learning_accuracy'
        ]

class DeckSerializer(serializers.ModelSerializer):
    """
    Deck serializer
    """
    owner = UserSerializer(read_only=True)
    card_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'description', 'is_public', 
            'created_at', 'updated_at', 'owner', 'card_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner', 'card_count']

class DeckDetailSerializer(DeckSerializer):
    """
    Deck serializer with cards
    """
    cards = serializers.SerializerMethodField()
    
    class Meta(DeckSerializer.Meta):
        fields = DeckSerializer.Meta.fields + ['cards']
    
    def get_cards(self, obj):
        return CardSerializer(obj.cards.all(), many=True).data

class CardSerializer(serializers.ModelSerializer):
    """
    Card serializer
    """
    deck = serializers.PrimaryKeyRelatedField(
        queryset=Deck.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Card
        fields = ['id', 'front', 'back', 'deck', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class LearningSessionSerializer(serializers.ModelSerializer):
    """
    Learning session serializer
    """
    user = UserSerializer(read_only=True)
    deck = DeckSerializer(read_only=True)
    deck_id = serializers.PrimaryKeyRelatedField(
        queryset=Deck.objects.all(),
        source='deck',
        write_only=True
    )
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningSession
        fields = [
            'id', 'user', 'deck', 'deck_id', 'status',
            'started_at', 'ended_at', 'reviews_count'
        ]
        read_only_fields = ['started_at', 'ended_at', 'user']

    def get_reviews_count(self, obj):
        return obj.reviews.count()

class CardReviewSerializer(serializers.ModelSerializer):
    """
    Card review serializer
    """
    session = LearningSessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=LearningSession.objects.all(),
        source='session',
        write_only=True
    )
    card = CardSerializer(read_only=True)
    card_id = serializers.PrimaryKeyRelatedField(
        queryset=Card.objects.all(),
        source='card',
        write_only=True
    )
    
    class Meta:
        model = CardReview
        fields = [
            'id', 'session', 'session_id', 'card', 'card_id',
            'is_correct', 'time_taken', 'created_at'
        ]
        read_only_fields = ['created_at']