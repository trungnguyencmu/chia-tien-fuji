import { Icon, type IconName } from './Icon';

export interface Category {
  id: string;
  label: string;
  icon: IconName;
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', icon: 'utensils' },
  { id: 'drinks', label: 'Drinks', icon: 'coffee' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'hotel', label: 'Hotel', icon: 'bed' },
  { id: 'ticket', label: 'Tickets', icon: 'ticket' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'entertainment', label: 'Fun', icon: 'gamepad' },
  { id: 'other', label: 'Other', icon: 'package' },
];

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
      aria-pressed={!!selected}
    >
      <Icon name={category.icon} size={22} />
      <span>{category.label}</span>
    </button>
  );
}

interface CategorySelectorProps {
  selected?: string;
  onSelect: (category: Category) => void;
}

export function CategoryChipSelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="category-scroll-container">
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

/** Picks a category icon from free-text expense titles (expenses do not store a category). */
export function getIconForTitle(title: string): IconName {
  const lower = title.toLowerCase();
  if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('food') || lower.includes('meal')) return 'utensils';
  if (lower.includes('coffee') || lower.includes('drink') || lower.includes('beer') || lower.includes('wine')) return 'coffee';
  if (lower.includes('taxi') || lower.includes('uber') || lower.includes('grab') || lower.includes('transport') || lower.includes('bus') || lower.includes('flight')) return 'car';
  if (lower.includes('hotel') || lower.includes('hostel') || lower.includes('airbnb') || lower.includes('accommodation')) return 'bed';
  if (lower.includes('ticket') || lower.includes('museum') || lower.includes('tour')) return 'ticket';
  if (lower.includes('shop') || lower.includes('mall') || lower.includes('gift') || lower.includes('souvenir')) return 'shopping-bag';
  if (lower.includes('game') || lower.includes('movie') || lower.includes('concert') || lower.includes('fun')) return 'gamepad';
  return 'package';
}
