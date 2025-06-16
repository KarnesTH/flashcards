from django.contrib import admin

from .models import (
    Badge,
    Card,
    CardReview,
    Deck,
    LearningSession,
    Settings,
    Tag,
    UserBadge,
    User,
)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """
    Admin for Tag-Model
    This model is used to store the tags of a deck.
    """
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    """
    Admin for Deck-Model
    This model is used to store the decks of a user.
    """
    list_display = ('title', 'owner', 'is_public', 'created_at', 'updated_at')
    list_filter = ('is_public', 'tags', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    filter_horizontal = ('tags',)
    raw_id_fields = ('owner',)
    ordering = ('-updated_at',)

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    """
    Admin for Card-Model
    This model is used to store the cards of a deck.
    """
    list_display = ('front', 'deck', 'order', 'created_at')
    list_filter = ('deck', 'created_at')
    search_fields = ('front', 'back', 'deck__title')
    raw_id_fields = ('deck',)
    ordering = ('deck', 'order')

@admin.register(LearningSession)
class LearningSessionAdmin(admin.ModelAdmin):
    """
    Admin for LearningSession-Model
    This model is used to store the learning sessions of a user.
    """
    list_display = ('user', 'deck', 'status', 'started_at', 'ended_at')
    list_filter = ('status', 'started_at')
    search_fields = ('user__username', 'deck__title')
    raw_id_fields = ('user', 'deck')
    ordering = ('-started_at',)

@admin.register(CardReview)
class CardReviewAdmin(admin.ModelAdmin):
    """
    Admin for CardReview-Model
    This model is used to store the reviews of a card in a learning session.
    """
    list_display = (
        'session',
        'card',
        'is_correct',
        'difficulty_rating',
        'time_taken',
        'created_at',
    )
    list_filter = ('is_correct', 'difficulty_rating', 'created_at')
    search_fields = ('session__user__username', 'card__front')
    raw_id_fields = ('session', 'card')
    ordering = ('-created_at',)

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """
    Admin for Badge-Model
    This model is used to store the badges of a user.
    """
    list_display = ('name', 'condition', 'created_at')
    list_filter = ('condition', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """
    Admin for UserBadge-Model
    This model is used to store the badges of a user.
    """
    list_display = ('user', 'badge', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'badge__name')
    raw_id_fields = ('user', 'badge')
    ordering = ('-created_at',)

@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """
    Admin for Settings-Model
    This model is used to store the settings of a user.
    """
    list_display = (
        'user', 
        'theme', 
        'font_size', 
        'privacy_settings', 
        'notification_settings', 
        'created_at', 
        'updated_at'
    )
    raw_id_fields = ('user',)
    ordering = ('-updated_at',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Admin for User-Model
    This model is used to store the users of the application.
    """
    list_display = ('username', 'email', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)