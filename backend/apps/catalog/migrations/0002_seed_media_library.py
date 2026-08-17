from datetime import date

from django.db import migrations


CATEGORIES = {
    "sci-fi": ("Sci-Fi", "Future worlds, advanced technology, and journeys beyond Earth."),
    "action": ("Action", "High-stakes adventures, chases, and unforgettable heroes."),
    "drama": ("Drama", "Powerful character-driven stories and human experiences."),
    "mystery": ("Mystery", "Secrets, investigations, and puzzles waiting to be solved."),
    "animation": ("Animation", "Imaginative animated stories for every audience."),
    "thriller": ("Thriller", "Tense stories built around danger, suspense, and surprise."),
}

MOVIES = [
    ("Eclipse Protocol", "eclipse-protocol", "The signal was never meant for us.", "A cryptographer races to decode a warning hidden in a deep-space transmission.", "sci-fi", date(2026, 7, 18), 134, 8.8, "U/A 16+", "#6366F1", True),
    ("Neon Horizon", "neon-horizon", "Run beyond the light.", "A courier uncovers a conspiracy beneath a radiant megacity.", "action", date(2026, 6, 6), 118, 8.4, "U/A 13+", "#EC4899", True),
    ("The Last Signal", "the-last-signal", "Some messages never fade.", "A radio operator hears a voice broadcasting from decades in the past.", "mystery", date(2025, 11, 14), 126, 8.1, "U/A 16+", "#06B6D4", False),
    ("Arcadia", "arcadia", "Paradise has a price.", "A flawless virtual sanctuary begins to fracture around its residents.", "sci-fi", date(2026, 5, 22), 111, 7.9, "U/A 13+", "#22C55E", False),
    ("Zero Hour", "zero-hour", "Every second is borrowed.", "An intelligence agent races to prevent a synchronized global blackout.", "thriller", date(2025, 9, 19), 122, 8.3, "U/A 16+", "#EF4444", True),
    ("Velvet Night", "velvet-night", "The city keeps its secrets.", "A detective enters a glamorous underworld where every witness is lying.", "mystery", date(2025, 8, 8), 107, 7.8, "A", "#A855F7", False),
    ("Afterlight", "afterlight", "Hope survives the dark.", "Strangers cross a transformed continent after the world goes silent.", "drama", date(2026, 4, 10), 129, 8.6, "U/A 13+", "#F59E0B", True),
    ("Static Dreams", "static-dreams", "Reality is only a frequency.", "A musician discovers how to tune into the lives she might have lived.", "drama", date(2025, 6, 27), 104, 7.7, "U/A 13+", "#8B5CF6", False),
    ("Northstar", "northstar", "Find your way home.", "An explorer must survive the Arctic after an expedition disappears.", "action", date(2026, 3, 13), 115, 8.2, "U", "#3B82F6", True),
    ("Redline", "redline", "Speed is the only truth.", "Underground racers compete through the night for one final prize.", "action", date(2025, 5, 16), 109, 7.6, "U/A 16+", "#F43F5E", False),
    ("Echo Lake", "echo-lake", "The water remembers.", "A quiet family retreat reveals a secret beneath a mountain lake.", "thriller", date(2026, 2, 20), 113, 8.0, "U/A 16+", "#14B8A6", False),
    ("Paper Kingdom", "paper-kingdom", "Every story needs a hero.", "A young artist discovers that everything she draws becomes real.", "animation", date(2025, 12, 19), 102, 8.5, "U", "#F97316", True),
    ("Black Tides", "black-tides", "Nothing stays buried.", "A deep-sea salvage team finds more than a forgotten wreck.", "thriller", date(2026, 1, 30), 121, 7.9, "U/A 16+", "#0EA5E9", False),
    ("Golden State", "golden-state", "Dreams have consequences.", "Three artists chase success and identity in modern Los Angeles.", "drama", date(2025, 4, 11), 116, 7.8, "U/A 13+", "#EAB308", False),
    ("Memory Lane", "memory-lane", "Yesterday is closer than it appears.", "An inventor lets strangers revisit memories, until one refuses to end.", "sci-fi", date(2025, 3, 7), 108, 8.0, "U/A 13+", "#D946EF", False),
    ("Tiny Giants", "tiny-giants", "Small team. Huge adventure.", "Miniature guardians defend their garden from an unexpected invasion.", "animation", date(2025, 1, 24), 96, 7.5, "U", "#84CC16", False),
    ("Cold Case", "cold-case", "Truth never expires.", "A retired investigator returns when new evidence reopens her defining case.", "mystery", date(2024, 12, 6), 119, 8.1, "U/A 16+", "#64748B", False),
    ("Firebreak", "firebreak", "Hold the line.", "An elite rescue crew is trapped between a wildfire and an isolated town.", "action", date(2024, 10, 18), 112, 7.7, "U/A 13+", "#DC2626", False),
]


def seed_catalog(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Movie = apps.get_model("catalog", "Movie")
    categories = {}
    for slug, (name, description) in CATEGORIES.items():
        category, _ = Category.objects.get_or_create(
            slug=slug, defaults={"name": name, "description": description}
        )
        categories[slug] = category

    for title, slug, tagline, description, category_slug, release_date, duration, rating, maturity, accent, featured in MOVIES:
        Movie.objects.get_or_create(
            slug=slug,
            defaults={
                "title": title,
                "tagline": tagline,
                "description": description,
                "category": categories[category_slug],
                "release_date": release_date,
                "duration_minutes": duration,
                "rating": rating,
                "maturity_rating": maturity,
                "accent_color": accent,
                "is_featured": featured,
                "is_published": True,
            },
        )


def remove_seed_catalog(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Movie = apps.get_model("catalog", "Movie")
    Movie.objects.filter(slug__in=[movie[1] for movie in MOVIES]).delete()
    for category in Category.objects.filter(slug__in=CATEGORIES):
        if not category.movies.exists():
            category.delete()


class Migration(migrations.Migration):
    dependencies = [("catalog", "0001_initial")]

    operations = [migrations.RunPython(seed_catalog, remove_seed_catalog)]

