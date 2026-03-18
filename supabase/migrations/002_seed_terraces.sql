-- SunSpot — seed data: 15 real Paris terraces with realistic orientations
-- Run after 001_create_terraces.sql

INSERT INTO terraces (name, address, location, orientation, open_hours) VALUES
  (
    'Café de Flore',
    '172 Bd Saint-Germain, 75006 Paris',
    ST_GeogFromText('POINT(2.3328 48.8540)'),
    195,  -- faces roughly south-southwest
    '07:30-01:30'
  ),
  (
    'Les Deux Magots',
    '6 Pl. Saint-Germain des Prés, 75006 Paris',
    ST_GeogFromText('POINT(2.3330 48.8541)'),
    180,  -- faces south
    '07:30-01:00'
  ),
  (
    'Café Procope',
    '13 Rue de l''Ancienne Comédie, 75006 Paris',
    ST_GeogFromText('POINT(2.3395 48.8527)'),
    90,   -- faces east
    '12:00-00:00'
  ),
  (
    'Le Consulat',
    '18 Rue Norvins, 75018 Paris',
    ST_GeogFromText('POINT(2.3403 48.8865)'),
    200,  -- faces south-southwest (Montmartre, hillside)
    '08:00-00:30'
  ),
  (
    'Terrasse de la Sainte-Chapelle',
    '8 Bd du Palais, 75001 Paris',
    ST_GeogFromText('POINT(2.3450 48.8554)'),
    270,  -- faces west
    '09:00-19:00'
  ),
  (
    'Café de la Paix',
    '5 Pl. de l''Opéra, 75009 Paris',
    ST_GeogFromText('POINT(2.3320 48.8709)'),
    180,  -- faces south toward the grands boulevards
    '08:00-00:00'
  ),
  (
    'Le Grand Véfour',
    '17 Rue de Beaujolais, 75001 Paris',
    ST_GeogFromText('POINT(2.3376 48.8637)'),
    90,   -- Palais-Royal garden, faces east
    '12:00-14:00'
  ),
  (
    'Brasserie Lipp',
    '151 Bd Saint-Germain, 75006 Paris',
    ST_GeogFromText('POINT(2.3338 48.8542)'),
    0,    -- faces north (across from Flore)
    '11:00-01:00'
  ),
  (
    'Café Marly',
    '93 Rue de Rivoli, 75001 Paris',
    ST_GeogFromText('POINT(2.3361 48.8607)'),
    270,  -- Louvre courtyard, faces west toward the pyramid
    '08:00-02:00'
  ),
  (
    'Rosa Bonheur sur Seine',
    'Port des Invalides, 75007 Paris',
    ST_GeogFromText('POINT(2.3105 48.8615)'),
    180,  -- riverbank terrace, faces south
    '12:00-00:00'
  ),
  (
    'Pavillon de la Fontaine',
    'Jardin du Luxembourg, 75006 Paris',
    ST_GeogFromText('POINT(2.3370 48.8477)'),
    135,  -- faces southeast (garden interior)
    '10:00-19:00'
  ),
  (
    'Chez Prune',
    '36 Rue Beaurepaire, 75010 Paris',
    ST_GeogFromText('POINT(2.3626 48.8682)'),
    225,  -- Canal Saint-Martin, faces southwest
    '09:00-01:30'
  ),
  (
    'Le Baron Rouge',
    '1 Rue Théophile Roussel, 75012 Paris',
    ST_GeogFromText('POINT(2.3764 48.8503)'),
    90,   -- Aligre market, faces east
    '10:00-22:00'
  ),
  (
    'Café des Anges',
    '66 Rue de la Roquette, 75011 Paris',
    ST_GeogFromText('POINT(2.3765 48.8545)'),
    180,  -- Bastille area, faces south
    '08:00-02:00'
  ),
  (
    'Terrasse du Parc de Belleville',
    '47 Rue des Couronnes, 75020 Paris',
    ST_GeogFromText('POINT(2.3827 48.8706)'),
    315,  -- hillside park, faces northwest with view of Paris
    '07:00-21:00'
  );
