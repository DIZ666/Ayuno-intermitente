/**
 * Etapas Fisiológicas del Ayuno Intermitente
 * Basado en fisiología médica y metabolismo de ayuno (0-24+ horas)
 */

const FASTING_STAGES = [
  {
    id: 'anabolic',
    minHours: 0,
    maxHours: 4,
    title: 'Fase Alimentada / Anabólica',
    subtitle: 'Digestión y Elevación de Insulina',
    icon: '🥗',
    badgeClass: 'stage-anabolic',
    shortDesc: 'Tu cuerpo está procesando la última comida e incrementando la captación de glucosa.',
    details: [
      'Niveles de glucosa e insulina elevados en sangre.',
      'El cuerpo utiliza la glucosa como fuente primaria de energía instantánea.',
      'El exceso de energía se almacena como glucógeno en hígado y músculos.'
    ],
    benefits: ['Nutrición muscular y reparación celular inmediata.'],
    tip: 'Befe suficiente agua para facilitar la digestión inicial.'
  },
  {
    id: 'post_absorptive',
    minHours: 4,
    maxHours: 8,
    title: 'Fase Posabsorbente',
    subtitle: 'Caída de Insulina & Transición Energética',
    icon: '📉',
    badgeClass: 'stage-postabsorptive',
    shortDesc: 'La insulina disminuye y el cuerpo deja de almacenar para empezar a usar glucógeno.',
    details: [
      'Disminuyen significativamente la glucosa en sangre y la insulina.',
      'El páncreas empieza a liberar glucagón para mantener estable la glucemia.',
      'Comienza la degradación suave del glucógeno hepático.'
    ],
    benefits: ['Disminución del almacenamiento de grasa', 'Reducción de picos metabólicos'],
    tip: 'Si sientes un leve antojo, bebe agua helada o un té de hierbas sin azúcar.'
  },
  {
    id: 'lipolysis',
    minHours: 8,
    maxHours: 12,
    title: 'Activación de Lipólisis',
    subtitle: 'Quema de Grasa Corporal Activa',
    icon: '🔥',
    badgeClass: 'stage-lipolysis',
    shortDesc: 'Agotamiento gradual de glucógeno. Los adipocitos liberan ácidos grasos como combustible.',
    details: [
      'El glucógeno hepático se reduce notablemente.',
      'La lipólisis se acelera: la grasa almacenada es convertida en ácidos grasos libres.',
      'La insulina alcanza niveles basales muy bajos.'
    ],
    benefits: ['Pérdida acelerada de tejido graso', 'Mejora en la sensibilidad a la insulina'],
    tip: 'Un café negro o té verde potencia la movilización de grasas en este periodo.'
  },
  {
    id: 'early_ketosis',
    minHours: 12,
    maxHours: 16,
    title: 'Cetosis Temprana & Claridad',
    subtitle: 'Producción de Cuerpos Cetónicos',
    icon: '⚡',
    badgeClass: 'stage-ketosis',
    shortDesc: 'Tu hígado empieza a sintetizar cetonas. Se activa una gran claridad mental y flexibilidad metabólica.',
    details: [
      'El hígado convierte los ácidos grasos en cuerpos cetónicos (beta-hidroxibutirato).',
      'El cerebro comienza a usar cetonas como combustible alternativo ultralimpio.',
      'Sensación notable de energía sostenida y reducción del hambre.'
    ],
    benefits: ['Claridad mental y foco agudo', 'Supresión natural del apetito', 'Quema directa de grasa visceral'],
    tip: 'Añade una pizca de sal marina al agua para mantener electrolitos equilibrados.'
  },
  {
    id: 'autophagy_peak',
    minHours: 16,
    maxHours: 18,
    title: 'Pico de Autofagia & Hormona de Crecimiento',
    subtitle: 'Zona Dorada 18:6 (Reciclaje Celular Propiamente Dicho)',
    icon: '✨',
    badgeClass: 'stage-autophagy',
    shortDesc: '¡El hito dorado de tu modelo 18:6! Reciclaje celular profundo y preservación de masa muscular.',
    details: [
      'Se activa con fuerza la **Autofagia**: las células eliminan componentes dañados, toxinas y proteínas senescentes.',
      'Se dispara la **Hormona de Crecimiento Humano (HGH)** (hasta un 300-500% más), protegiendo la masa muscular.',
      'Reducción drástica de marcadores inflamatorios celulares.'
    ],
    benefits: ['Rejuvenecimiento celular activo', 'Protección del músculo magro', 'Desintoxicación profunda', 'Anti-envejecimiento'],
    tip: '¡Estás en la cima del ayuno 18:6! Disfruta de la sensación de renovación.'
  },
  {
    id: 'deep_autophagy',
    minHours: 18,
    maxHours: 999,
    title: 'Cetosis Profunda & Autofagia Avanzada',
    subtitle: 'Renovación Tisular Extendida',
    icon: '🌟',
    badgeClass: 'stage-deep-autophagy',
    shortDesc: 'Has superado la meta 18:6. Tu cuerpo está en un estado óptimo de regeneración y quema lipídica.',
    details: [
      'Niveles elevados de cetonas y máxima expresión de genes de longevidad.',
      'La autofagia alcanza tejidos periféricos e inmunitarios.',
      'Máxima eficiencia mitocondrial.'
    ],
    benefits: ['Reparación celular profunda', 'Sensibilidad insulínica máxima', 'Reset del sistema inmune'],
    tip: 'Recuerda romper el ayuno con una comida nutritiva, alta en proteínas y grasas saludables.'
  }
];

/**
 * Obtiene la etapa fisiológica actual según las horas transcurridas
 * @param {number} hours 
 * @returns {object} Etapa del ayuno
 */
function getFastingStageByHours(hours) {
  const h = Math.max(0, hours);
  const stage = FASTING_STAGES.find(s => h >= s.minHours && h < s.maxHours);
  return stage || FASTING_STAGES[FASTING_STAGES.length - 1];
}
