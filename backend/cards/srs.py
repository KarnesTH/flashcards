from datetime import timedelta
from django.db.models import F, Q
from django.db.models.expressions import ExpressionWrapper
from django.db.models.fields import DurationField
from django.db.models.functions import Coalesce
from django.utils import timezone
from cards.models import Card, Deck
import random


def get_cards_for_review(deck: Deck, limit: int = 20) -> list[Card]:
    """
    Selects cards for a review session based on due dates and a weighting algorithm.
    """
    now = timezone.now()

    due_cards_qs = Card.objects.filter(deck=deck).filter(
        Q(next_review__lte=now) | Q(next_review__isnull=True)
    )

    weighted_cards = (
        due_cards_qs.annotate(
            days_overdue=ExpressionWrapper(
                now - Coalesce(F("next_review"), now - timedelta(days=365)),
                output_field=DurationField(),
            )
        )
        .annotate(
            weight=(
                (F("days_overdue") / timedelta(days=1)) * 1.5
                + (1.0 / (F("repetition_count") + 0.5)) * 1.0
                + F("average_review_time") * 0.1
            )
        )
        .order_by("-weight")
    )

    sorted_cards = list(weighted_cards)

    top_cards = sorted_cards[:limit]
    random.shuffle(top_cards)

    remaining_cards = sorted_cards[limit:]

    return top_cards + remaining_cards


def evaluate_review(card: Card, is_correct: bool, taken_time: float) -> None:
    """
    Evaluates a card review based on correctness and time taken,
    then updates the card's SRS attributes using a SM-2 algorithm.
    """
    card.last_reviewed = timezone.now()

    card.total_review_time += round(taken_time)
    total_reviews = card.repetition_count + card.incorrect_count
    if total_reviews > 0:
        card.average_review_time = card.total_review_time / total_reviews

    if not is_correct:
        card.incorrect_count += 1
        card.repetition_count = 0
        card.interval = 1
        card.next_review = timezone.now() + timedelta(days=1)
    else:
        card.correct_count += 1
        
        if card.average_review_time > 0:
            if taken_time < card.average_review_time * 0.75:
                q = 5
            elif taken_time > card.average_review_time * 1.25:
                q = 2
            else:
                q = 4
        else:
            q = 4

        new_ease_factor = card.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        card.ease_factor = max(1.3, new_ease_factor)

        card.repetition_count += 1

        if card.repetition_count == 1:
            card.interval = 1
        elif card.repetition_count == 2:
            card.interval = 6
        else:
            card.interval = round(card.interval * card.ease_factor)

        card.next_review = timezone.now() + timedelta(days=card.interval)

    card.save()