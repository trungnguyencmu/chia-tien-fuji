export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'drinks', label: 'Drinks', emoji: '🍺' },
  { id: 'transport', label: 'Transport', emoji: '🚕' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
  { id: 'ticket', label: 'Tickets', emoji: '🎫' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', label: 'Fun', emoji: '🎮' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

interface CategoryTagProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryTag({ category, selected, onClick }: CategoryTagProps) {
  return (
    <button
      type="button"
      className={`category-tag ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span>{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
}

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      className={`category-chip ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="category-chip-emoji">{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
}

interface CategorySelectorProps {
  selected?: string;
  onSelect: (category: Category) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {CATEGORIES.map((cat) => (
        <CategoryTag
          key={cat.id}
          category={cat}
          selected={selected === cat.id}
          onClick={() => onSelect(cat)}
        />
      ))}
    </div>
  );
}

export function CategoryChipSelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="category-scroll-container" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
      {CATEGORIES.map((cat) => (
        <CategoryChip
          key={cat.id}
          category={cat}
          selected={selected === cat.id}
          onClick={() => onSelect(cat)}
        />
      ))}
    </div>
  );
}

export function getCategoryById(id: string): Category {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getEmojiForTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('food') || lower.includes('meal')) return '🍜';
  if (lower.includes('coffee') || lower.includes('drink') || lower.includes('beer') || lower.includes('wine')) return '🍺';
  if (lower.includes('taxi') || lower.includes('uber') || lower.includes('grab') || lower.includes('transport') || lower.includes('bus') || lower.includes('flight')) return '🚕';
  if (lower.includes('hotel') || lower.includes('hostel') || lower.includes('airbnb') || lower.includes('accommodation')) return '🏨';
  if (lower.includes('ticket') || lower.includes('museum') || lower.includes('tour')) return '🎫';
  if (lower.includes('shop') || lower.includes('mall') || lower.includes('gift') || lower.includes('souvenir')) return '🛍️';
  if (lower.includes('game') || lower.includes('movie') || lower.includes('concert') || lower.includes('fun')) return '🎮';
  return '📦';
}
