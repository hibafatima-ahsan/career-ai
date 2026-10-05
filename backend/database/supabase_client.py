from supabase import create_client
from config import Config


if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing.")


supabase = create_client(
    Config.SUPABASE_URL,
    Config.SUPABASE_KEY
)


print("Supabase client created successfully!")