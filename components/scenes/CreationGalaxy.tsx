'use client';

interface CreationGalaxyProps {
  activeCategory: string;
  categories: Array<{ id: string; label: string }>;
  onChange: (id: string) => void;
}

export default function CreationGalaxy({
  activeCategory,
  categories,
  onChange,
}: CreationGalaxyProps) {
  const activeLabel = categories.find((category) => category.id === activeCategory)?.label;

  return (
    <section className="archive-creation-chart" aria-label="个人创作分类图谱">
      <header>
        <span>CREATIVE FIELD CHART / 05</span>
        <strong>创作路径图</strong>
        <p>沿着记录线选择一类创作，查看对应存档。</p>
      </header>

      <div className="archive-creation-chart__route">
        {categories.map((category, index) => {
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              className={active ? 'is-active' : undefined}
              aria-pressed={active}
              onClick={() => onChange(category.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{category.label}</strong>
              <small>{active ? '正在阅览' : '打开卷宗'}</small>
            </button>
          );
        })}
      </div>

      <footer>
        <span>SELECTED FOLIO</span>
        <strong>{activeLabel ?? '未选择'}</strong>
      </footer>
    </section>
  );
}
