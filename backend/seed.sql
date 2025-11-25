
-- Seed данные для PRO.casa.kz
-- Пароли: admin123, broker123, developer123

-- Админ
INSERT INTO users (id, email, password, role, first_name, last_name, phone, is_active, created_at, updated_at)
VALUES (
  'admin_001',
  'admin@casa.kz',
  '$2a$10$3Fha88RA5TkTRJ9mglnPB.URjwwksyKyrGLE4Gu6Ilc/LQG3yMOQy',
  'ADMIN',
  'Администратор',
  'Casa',
  '+77001234567',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Брокер
INSERT INTO users (id, email, password, role, first_name, last_name, phone, is_active, created_at, updated_at)
VALUES (
  'broker_001',
  'broker@casa.kz',
  '$2a$10$UUkcdOzJKN6024zeybaYz.oBAy9bxreV1eJsQ4iOwdVhTYD2my.Si',
  'BROKER',
  'Иван',
  'Иванов',
  '+77001234568',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Застройщик
INSERT INTO users (id, email, password, role, first_name, last_name, phone, is_active, created_at, updated_at)
VALUES (
  'developer_001',
  'developer@casa.kz',
  '$2a$10$8SPn89wm3b1Z77sNqGzXuOcd5V/jcXeTqD4MrMO1LL9L1XioCKfxy',
  'DEVELOPER',
  'Петр',
  'Петров',
  '+77001234569',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

SELECT 'Seed completed successfully!' as status;
SELECT id, email, role, first_name, last_name FROM users;

