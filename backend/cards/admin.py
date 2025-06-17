from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Card, CardReview, Deck, LearningSession, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    User admin configuration
    """
    list_display = ['username', 'email', 'first_name', 'last_name', 'last_active']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Zusätzliche Informationen', {'fields': ('bio', 'last_active')}),
    )
    readonly_fields = ['last_active']

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    """
    Deck admin configuration
    """
    list_display = ['title', 'owner', 'is_public', 'card_count', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title', 'description', 'owner__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    """
    Card admin configuration
    """
    list_display = ['front', 'deck', 'created_at']
    list_filter = ['deck', 'created_at']
    search_fields = ['front', 'back', 'deck__title']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(LearningSession)
class LearningSessionAdmin(admin.ModelAdmin):
    """
    Learning session admin configuration
    """
    list_display = ['user', 'deck', 'status', 'started_at', 'ended_at']
    list_filter = ['status', 'started_at']
    search_fields = ['user__username', 'deck__title']
    ordering = ['-started_at']
    readonly_fields = ['started_at', 'ended_at']

@admin.register(CardReview)
class CardReviewAdmin(admin.ModelAdmin):
    """
    Card review admin configuration
    """
    list_display = ['session', 'card', 'is_correct', 'time_taken', 'created_at']
    list_filter = ['is_correct', 'created_at']
    search_fields = ['session__user__username', 'card__front']
    ordering = ['-created_at']
    readonly_fields = ['created_at']