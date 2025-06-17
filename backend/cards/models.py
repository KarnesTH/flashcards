from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    User model 
    """
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text=_('Kurze Beschreibung des Benutzers')
    )
    last_active = models.DateTimeField(
        auto_now=True,
        help_text=_('Letzte Aktivität des Benutzers')
    )

    class Meta:
        verbose_name = _('Benutzer')
        verbose_name_plural = _('Benutzer')
        ordering = ['-date_joined']

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def total_cards_created(self):
        """Calculate the total number of cards created"""
        return Card.objects.filter(deck__owner=self).count()

    @property
    def total_decks_created(self):
        """Calculate the total number of decks created"""
        return self.decks.count()

    @property
    def total_learning_sessions(self):
        """Calculate the total number of completed learning sessions"""
        return self.learning_sessions.filter(status='completed').count()

    @property
    def total_cards_reviewed(self):
        """Calculate the total number of cards reviewed"""
        return CardReview.objects.filter(session__user=self).count()

    @property
    def total_correct_answers(self):
        """Calculate the total number of correct answers"""
        return CardReview.objects.filter(session__user=self, is_correct=True).count()

    @property
    def learning_accuracy(self):
        """Calculate the overall learning accuracy"""
        total_reviews = self.total_cards_reviewed
        if total_reviews == 0:
            return 0
        return (self.total_correct_answers / total_reviews) * 100

class Deck(models.Model):
    """
    Deck model
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='decks',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    @property
    def card_count(self):
        """Number of cards in the deck"""
        return self.cards.count()

class Card(models.Model):
    """
    Card model
    """
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='cards',
    )
    front = models.TextField()
    back = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.front[:50] + "..." if len(self.front) > 50 else self.front

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
    time_taken = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.session.user.username} - {self.card.front}"
