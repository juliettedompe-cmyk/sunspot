-- SunSpot — seed data: 15 real Paris terraces
-- Depends on: 001_create_terraces.sql

INSERT INTO terraces (name, address, latitude, longitude, orientation, open_hours, venue_type, source)
VALUES
  (
    'Café de Flore',
    '172 Bd Saint-Germain, 75006 Paris',
    48.8540, 2.3328,
    195,          -- faces roughly south-southwest
    '07:30-01:30',
    'café', 'manual'
  ),
  (
    'Les Deux Magots',
    '6 Pl. Saint-Germain des Prés, 75006 Paris',
    48.8541, 2.3330,
    180,          -- faces south
    '07:30-01:00',
    'café', 'manual'
  ),
  (
    'Café Procope',
    '13 Rue de l''Ancienne Comédie, 75006 Paris',
    48.8527, 2.3395,
    90,           -- faces east
    '12:00-00:00',
    'restaurant', 'manual'
  ),
  (
    'Le Consulat',
    '18 Rue Norvins, 75018 Paris',
    48.8865, 2.3403,
    200,          -- faces south-southwest (Montmartre hillside)
    '08:00-00:30',
    'café', 'manual'
  ),
  (
    'Terrasse de la Sainte-Chapelle',
    '8 Bd du Palais, 75001 Paris',
    48.8554, 2.3450,
    270,          -- faces west
    '09:00-19:00',
    'bar', 'manual'
  ),
  (
    'Café de la Paix',
    '5 Pl. de l''Opéra, 75009 Paris',
    48.8709, 2.3320,
    180,          -- faces south toward the grands boulevards
    '08:00-00:00',
    'brasserie', 'manual'
  ),
  (
    'Le Grand Véfour',
    '17 Rue de Beaujolais, 75001 Paris',
    48.8637, 2.3376,
    90,           -- Palais-Royal garden, faces east
    '12:00-14:00',
    'restaurant', 'manual'
  ),
  (
    'Brasserie Lipp',
    '151 Bd Saint-Germain, 75006 Paris',
    48.8542, 2.3338,
    0,            -- faces north (across from Flore)
    '11:00-01:00',
    'brasserie', 'manual'
  ),
  (
    'Café Marly',
    '93 Rue de Rivoli, 75001 Paris',
    48.8607, 2.3361,
    270,          -- Louvre courtyard, faces west toward the pyramid
    '08:00-02:00',
    'café', 'manual'
  ),
  (
    'Rosa Bonheur sur Seine',
    'Port des Invalides, 75007 Paris',
    48.8615, 2.3105,
    180,          -- riverbank terrace, faces south
    '12:00-00:00',
    'bar', 'manual'
  ),
  (
    'Pavillon de la Fontaine',
    'Jardin du Luxembourg, 75006 Paris',
    48.8477, 2.3370,
    135,          -- faces southeast (garden interior)
    '10:00-19:00',
    'café', 'manual'
  ),
  (
    'Chez Prune',
    '36 Rue Beaurepaire, 75010 Paris',
    48.8682, 2.3626,
    225,          -- Canal Saint-Martin, faces southwest
    '09:00-01:30',
    'bar', 'manual'
  ),
  (
    'Le Baron Rouge',
    '1 Rue Théophile Roussel, 75012 Paris',
    48.8503, 2.3764,
    90,           -- Aligre market, faces east
    '10:00-22:00',
    'bar', 'manual'
  ),
  (
    'Café des Anges',
    '66 Rue de la Roquette, 75011 Paris',
    48.8545, 2.3765,
    180,          -- Bastille area, faces south
    '08:00-02:00',
    'café', 'manual'
  ),
  (
    'Terrasse du Parc de Belleville',
    '47 Rue des Couronnes, 75020 Paris',
    48.8706, 2.3827,
    315,          -- hillside park, faces northwest with Paris panorama
    '07:00-21:00',
    'bar', 'manual'
  );
