from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer, UserSerializer
from rest_framework import serializers

from .models import (
    Badge,
    Card,
    CardReview,
    Deck,
    LearningSession,
    Settings,
    Tag,
    UserBadge,
)

User = get_user_model()

class CustomUserCreateSerializer(UserCreateSerializer):
    """
    Custom Serializer für die Benutzerregistrierung
    """
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = (
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

class CustomUserSerializer(UserSerializer):
    """
    Custom Serializer für Benutzerdaten
    """
    statistics = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'avatar',
            'bio',
            'date_joined',
            'last_active',
            'statistics',
            'settings',
        )
        read_only_fields = (
            'id',
            'date_joined',
            'last_active',
            'statistics',
            'settings',
        )

    def get_statistics(self, obj):
        return {
            'total_cards_created': obj.total_cards_created,
            'total_cards_reviewed': obj.total_cards_reviewed,
            'total_learning_sessions': obj.total_learning_sessions,
            'average_accuracy': obj.average_accuracy,
        }

    def get_settings(self, obj):
        try:
            return SettingsSerializer(obj.settings).data
        except Settings.DoesNotExist:
            return None

class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag-Model
    """
    class Meta:
        model = Tag
        fields = ('id', 'name', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class CardSerializer(serializers.ModelSerializer):
    """
    Serializer for Card-Model
    """
    class Meta:
        model = Card
        fields = ('id', 'deck', 'front', 'back', 'order', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

    def validate_order(self, value):
        deck_id = self.initial_data.get('deck')
        if deck_id and Card.objects.filter(deck_id=deck_id, order=value).exists():
            raise serializers.ValidationError("Diese Position ist bereits vergeben.")
        return value

class DeckSerializer(serializers.ModelSerializer):
    """
    Serializer for Deck-Model
    """
    owner = CustomUserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    cards_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Deck
        fields = ('id', 'owner', 'title', 'description', 'tags', 'is_public', 
                 'cards_count', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at', 'owner')

    def get_cards_count(self, obj):
        return obj.cards.count()

class DeckDetailSerializer(DeckSerializer):
    cards = CardSerializer(many=True, read_only=True)
    
    class Meta(DeckSerializer.Meta):
        fields = DeckSerializer.Meta.fields + ('cards',)

class LearningSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for LearningSession-Model
    """
    user = CustomUserSerializer(read_only=True)
    deck = DeckSerializer(read_only=True)
    deck_id = serializers.PrimaryKeyRelatedField(
        queryset=Deck.objects.all(),
        source='deck',
        write_only=True
    )
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningSession
        fields = (
            'id', 
            'user',
            'deck',
            'deck_id',
            'status',
            'started_at',
            'ended_at',
            'reviews_count',
        )
        read_only_fields = ('started_at', 'ended_at', 'user')

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def validate(self, data):
        if data.get('ended_at') and data['ended_at'] < data.get('started_at'):
            raise serializers.ValidationError(
                "End time cannot be before start time."
            )
        return data

class CardReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for CardReview-Model
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
        fields = ('id', 'session', 'session_id', 'card', 'card_id', 'is_correct', 
                 'difficulty_rating', 'time_taken', 'created_at')
        read_only_fields = ('created_at',)

    def validate_difficulty_rating(self, value):
        if value and (value < 1 or value > 5):
            raise serializers.ValidationError(
                "Difficulty rating must be between 1 and 5."
            )
        return value

class BadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for Badge-Model
    """
    class Meta:
        model = Badge
        fields = ('id', 'name', 'description', 'icon', 'condition', 
                 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class UserBadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for UserBadge-Model
    """
    user = CustomUserSerializer(read_only=True)
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ('id', 'user', 'badge', 'created_at')
        read_only_fields = ('created_at',)

class SettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for Settings-Model
    """
    class Meta:
        model = Settings
        fields = (
            'id', 
            'user', 
            'theme', 
            'font_size', 
            'privacy_settings', 
            'notification_settings', 
            'created_at', 
            'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')