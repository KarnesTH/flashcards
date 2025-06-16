from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    """
    Tag for a Deck
    """
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Deck(models.Model):
    """
    Deck of cards
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='decks',
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    tags = models.ManyToManyField(Tag, related_name='decks')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

class Card(models.Model):
    """
    Card in a deck
    """
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='cards',
    )
    front = models.TextField()
    back = models.TextField()
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.front
    
class LearningSession(models.Model):
    """
    Learning session for a deck
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Aktiv')
        COMPLETED = 'completed', _('Abgeschlossen')
        ABANDONED = 'abandoned', _('Abgebrochen')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='learning_sessions',
    )
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='learning_sessions',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.deck.title}"
    
class CardReview(models.Model):
    """
    Review of a card in a learning session
    """
    session = models.ForeignKey(
        LearningSession,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    card = models.ForeignKey(
        Card,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    is_correct = models.BooleanField(default=False)
    difficulty_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    time_taken = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.session.user.username} - {self.card.front}"
    
class Badge(models.Model):
    """
    Badge for a user
    """
    class Condition(models.TextChoices):
        FIRST_DECK = 'first_deck', _('Erstes Deck erstellt')
        FIRST_REVIEW = 'first_review', _('Erste Karte bewertet')
        PERFECT_SESSION = 'perfect_session', _('Perfekte Lernsession')
        DECK_MASTER = 'deck_master', _('Deck-Meister')
        REVIEW_STREAK = 'review_streak', _('Lernstreak')

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    icon = models.ImageField(upload_to='badges/')
    condition = models.CharField(
        max_length=50,
        choices=Condition.choices,
        unique=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
    
class UserBadge(models.Model):
    """
    Badge of a user
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='badges',
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
    
class Settings(models.Model):
    """
    Settings for a user
    """
    class Theme(models.TextChoices):
        """
        Theme for the user
        """
        LIGHT = 'light', _('Hell')
        DARK = 'dark', _('Dunkel')
        SYSTEM = 'system', _('System')
    
    class FontSize(models.TextChoices):
        """
        Font size for the user
        """
        SMALL = 'small', _('Klein')
        MEDIUM = 'medium', _('Mittel')
        LARGE = 'large', _('Groß')
    
    class PrivacySettings(models.TextChoices):
        """
        Privacy settings for the user
        """
        SHOW_STATS = 'show_stats', _('Stats anzeigen')
        SHOW_DECKS = 'show_decks', _('Decks anzeigen')
        SHOW_PROGRESS = 'show_progress', _('Fortschritt anzeigen')
    
    class NotificationSettings(models.TextChoices):
        """
        Notification settings for the user
        """
        EMAIL_NOTIFICATIONS = 'email_notifications', _('E-Mail-Benachrichtigungen')
        LEARNING_REMINDERS = 'learning_reminders', _('Lern-Erinnerungen')
        ACHIEVEMENT_ALERTS = 'achievement_alerts', _('Erfolgsbenachrichtigungen')

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='settings',
    )
    theme = models.CharField(
        max_length=255,
        choices=Theme.choices,
        default=Theme.SYSTEM
    )
    font_size = models.CharField(
        max_length=255,
        choices=FontSize.choices,
        default=FontSize.MEDIUM
    )
    privacy_settings = models.CharField(
        max_length=255,
        choices=PrivacySettings.choices,
        default=PrivacySettings.SHOW_STATS
    )
    notification_settings = models.CharField(
        max_length=255,
        choices=NotificationSettings.choices,
        default=NotificationSettings.EMAIL_NOTIFICATIONS
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.theme} - {self.font_size}"

    class Meta:
        verbose_name = _('Einstellungen')
        verbose_name_plural = _('Einstellungen')
        ordering = ['-updated_at']
