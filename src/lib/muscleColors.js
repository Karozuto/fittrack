// Une couleur par région anatomique : tous les muscles d'une même région
// partagent exactement la même couleur (bras, jambes, dos, ventre, etc.).

const REGION = {
  poitrine: '#3EE0FF', // cyan
  dos:      '#A8FF3E', // vert lime
  épaules:  '#C03EFF', // violet
  bras:     '#FF3E7A', // rose
  jambes:   '#FFD93E', // jaune
  ventre:   '#3EFFB0', // menthe
  cardio:   '#FF5757', // rouge
  corps:    '#8C9EFF', // indigo
}

export const MUSCLE_COLOR_MAP = {
  // Poitrine
  pectoraux:            REGION.poitrine,
  'pectoraux haut':     REGION.poitrine,
  'pectoraux bas':      REGION.poitrine,

  // Dos
  'grand dorsal':       REGION.dos,
  'rhomboïdes':         REGION.dos,
  'trapèzes':           REGION.dos,
  'érecteurs du rachis':REGION.dos,

  // Épaules
  'épaules':            REGION.épaules,
  'épaules antérieur':  REGION.épaules,
  'épaules médial':     REGION.épaules,
  'épaules postérieur': REGION.épaules,

  // Bras
  biceps:               REGION.bras,
  brachial:             REGION.bras,
  'brachio-radial':     REGION.bras,
  triceps:              REGION.bras,

  // Jambes
  quadriceps:           REGION.jambes,
  'ischio-jambiers':    REGION.jambes,
  fessiers:             REGION.jambes,
  gastrocnémiens:       REGION.jambes,
  'soléaire':           REGION.jambes,

  // Ventre / tronc
  abdominaux:           REGION.ventre,
  obliques:             REGION.ventre,
  transverse:           REGION.ventre,

  // Cardio
  'cardio-vasculaire':  REGION.cardio,

  // Corps entier
  'full body':          REGION.corps,
}

export function getMuscleColor(m) {
  return MUSCLE_COLOR_MAP[m?.toLowerCase()] || '#6B7068'
}
