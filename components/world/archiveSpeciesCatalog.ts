export interface ArchiveSpecies {
  id: string;
  label: string;
  habitat: '家园' | '林地' | '草原' | '河谷' | '海岸' | '天空';
}

// 性别差异、犬种和同种模型变体在此合并，不重复计算。
export const ARCHIVE_SPECIES = [
  { id: 'alpaca', label: '羊驼', habitat: '草原' },
  { id: 'deer', label: '鹿', habitat: '林地' },
  { id: 'donkey', label: '驴', habitat: '家园' },
  { id: 'fox', label: '赤狐', habitat: '林地' },
  { id: 'wolf-dog', label: '狼与家犬', habitat: '林地' },
  { id: 'horse', label: '马', habitat: '家园' },
  { id: 'jay', label: '松鸦', habitat: '天空' },
  { id: 'river-fish-a', label: '河鱼甲', habitat: '河谷' },
  { id: 'river-fish-b', label: '河鱼乙', habitat: '河谷' },
  { id: 'river-fish-c', label: '河鱼丙', habitat: '河谷' },
  { id: 'dolphin', label: '海豚', habitat: '海岸' },
  { id: 'manta-ray', label: '蝠鲼', habitat: '海岸' },
  { id: 'shark', label: '鲨鱼', habitat: '海岸' },
  { id: 'whale', label: '鲸', habitat: '海岸' },
  { id: 'cattle', label: '牛', habitat: '草原' },
  { id: 'llama', label: '美洲驼', habitat: '草原' },
  { id: 'pig', label: '猪', habitat: '家园' },
  { id: 'sheep', label: '绵羊', habitat: '草原' },
  { id: 'zebra', label: '斑马', habitat: '草原' },
  { id: 'rabbit', label: '兔', habitat: '林地' },
  { id: 'bee', label: '蜜蜂', habitat: '家园' },
  { id: 'chicken', label: '鸡', habitat: '家园' },
  { id: 'frog', label: '青蛙', habitat: '河谷' },
  { id: 'butterfly-fish', label: '蝴蝶鱼', habitat: '海岸' },
  { id: 'crab', label: '螃蟹', habitat: '海岸' },
  { id: 'snake', label: '蛇', habitat: '林地' },
  { id: 'wasp', label: '黄蜂', habitat: '天空' },
  { id: 'rat', label: '鼠', habitat: '家园' },
  { id: 'spider', label: '蜘蛛', habitat: '林地' },
  { id: 'panda', label: '熊猫', habitat: '林地' },
] as const satisfies readonly ArchiveSpecies[];

export const ARCHIVE_SPECIES_COUNT = ARCHIVE_SPECIES.length;
export type ArchiveSpeciesId = (typeof ARCHIVE_SPECIES)[number]['id'];
export const ARCHIVE_HABITATS = ['家园', '林地', '草原', '河谷', '海岸', '天空'] as const;

const ARCHIVE_SPECIES_IDS = new Set<string>(ARCHIVE_SPECIES.map((species) => species.id));

export function isArchiveSpeciesId(value: unknown): value is ArchiveSpeciesId {
  return typeof value === 'string' && ARCHIVE_SPECIES_IDS.has(value);
}

export function archiveSpeciesById(id: ArchiveSpeciesId) {
  return ARCHIVE_SPECIES.find((species) => species.id === id);
}

export function archiveObservedSpecies(ids: readonly ArchiveSpeciesId[]) {
  const observed = new Set(ids);
  return ARCHIVE_SPECIES.filter((species) => observed.has(species.id));
}

export function archiveHabitatProgress(ids: readonly ArchiveSpeciesId[]) {
  const observed = new Set(ids);
  return ARCHIVE_HABITATS.map((habitat) => {
    const species = ARCHIVE_SPECIES.filter((record) => record.habitat === habitat);
    return {
      habitat,
      observed: species.filter((record) => observed.has(record.id)).length,
      total: species.length,
    };
  });
}
