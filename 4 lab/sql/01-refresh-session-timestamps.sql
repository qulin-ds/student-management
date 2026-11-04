-- Применяется вручную через psql после резервного копирования и остановки backend.
-- bytea содержит сериализованный объект: преобразование его в дату не выполняется.
\set ON_ERROR_STOP on
BEGIN;
LOCK TABLE public.refresh_sessions IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE
    expiry_type text;
    revoked_type text;
BEGIN
    SELECT udt_name INTO expiry_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'refresh_sessions' AND column_name = 'expiresat';
    SELECT udt_name INTO revoked_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'refresh_sessions' AND column_name = 'revoked_at';

    IF expiry_type IS NULL OR expiry_type NOT IN ('bytea', 'timestamptz') THEN
        RAISE EXCEPTION 'Неожиданный тип expiresat: %. Миграция остановлена.', expiry_type;
    END IF;
    IF revoked_type IS NOT NULL AND revoked_type <> 'timestamptz' THEN
        RAISE EXCEPTION 'Неожиданный тип revoked_at: %. Миграция остановлена.', revoked_type;
    END IF;

    IF expiry_type = 'bytea' THEN
        -- Потеря только старых refresh-сессий; пользователи и студенты сохраняются.
        DELETE FROM public.refresh_sessions;
        ALTER TABLE public.refresh_sessions ALTER COLUMN expiresat
            TYPE timestamp with time zone USING NULL::timestamp with time zone;
        RAISE NOTICE 'Старые refresh-сессии удалены. Требуется повторный вход.';
    ELSE
        RAISE NOTICE 'expiresat уже исправлен; refresh-сессии сохранены.';
    END IF;

    IF revoked_type IS NULL THEN
        ALTER TABLE public.refresh_sessions ADD COLUMN revoked_at timestamp with time zone;
    END IF;
END $$;
COMMIT;

SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'refresh_sessions'
  AND column_name IN ('expiresat', 'revoked_at') ORDER BY column_name;
