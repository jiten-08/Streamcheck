from django.db import migrations


CAST_CREDITS = [
    ("eclipse-protocol", "Maya Chen", "maya-chen", "Dr. Lena Voss", 0),
    ("eclipse-protocol", "Daniel Okafor", "daniel-okafor", "Commander Elias Reed", 1),
    ("eclipse-protocol", "Sofia Reyes", "sofia-reyes", "Mara Quinn", 2),
    ("eclipse-protocol", "Theo Bennett", "theo-bennett", "Director Havel", 3),
    ("neon-horizon", "Sofia Reyes", "sofia-reyes", "Nova Vale", 0),
    ("neon-horizon", "Ethan Park", "ethan-park", "Jin Kade", 1),
    ("neon-horizon", "Amara Cole", "amara-cole", "Vesper", 2),
    ("the-last-signal", "Daniel Okafor", "daniel-okafor", "Jon Bell", 0),
    ("the-last-signal", "Nora Laurent", "nora-laurent", "Elise Ward", 1),
    ("arcadia", "Amara Cole", "amara-cole", "Ada Sol", 0),
    ("arcadia", "Theo Bennett", "theo-bennett", "Marcus Venn", 1),
    ("zero-hour", "Ethan Park", "ethan-park", "Agent Cole", 0),
    ("zero-hour", "Maya Chen", "maya-chen", "Dr. Sato", 1),
    ("afterlight", "Nora Laurent", "nora-laurent", "Iris", 0),
    ("afterlight", "Daniel Okafor", "daniel-okafor", "Malik", 1),
    ("paper-kingdom", "Amara Cole", "amara-cole", "Emi (voice)", 0),
    ("paper-kingdom", "Theo Bennett", "theo-bennett", "The Cartographer (voice)", 1),
]


def seed_cast(apps, schema_editor):
    Movie = apps.get_model("catalog", "Movie")
    CastMember = apps.get_model("catalog", "CastMember")
    MovieCast = apps.get_model("catalog", "MovieCast")
    for movie_slug, name, member_slug, character, order in CAST_CREDITS:
        movie = Movie.objects.filter(slug=movie_slug).first()
        if movie is None:
            continue
        member, _ = CastMember.objects.get_or_create(slug=member_slug, defaults={"name": name})
        MovieCast.objects.get_or_create(
            movie=movie,
            cast_member=member,
            defaults={"character": character, "order": order},
        )


def remove_seed_cast(apps, schema_editor):
    CastMember = apps.get_model("catalog", "CastMember")
    MovieCast = apps.get_model("catalog", "MovieCast")
    member_slugs = {credit[2] for credit in CAST_CREDITS}
    movie_slugs = {credit[0] for credit in CAST_CREDITS}
    MovieCast.objects.filter(
        movie__slug__in=movie_slugs, cast_member__slug__in=member_slugs
    ).delete()
    for member in CastMember.objects.filter(slug__in=member_slugs):
        if not member.movie_credits.exists():
            member.delete()


class Migration(migrations.Migration):
    dependencies = [("catalog", "0003_castmember_moviecast")]

    operations = [migrations.RunPython(seed_cast, remove_seed_cast)]

