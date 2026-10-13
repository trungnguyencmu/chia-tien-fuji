import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuest } from '../../contexts/guest-context';
import { Trip } from '../../api/api';
import { Expense } from '../../utils/calculation';
import {
  TripMember,
  GuestSettlement as GuestSettlementData,
  GuestTripImage,
  GuestAuthError,
  fetchGuestTrip,
  fetchGuestMembers,
  fetchGuestExpenses,
  fetchGuestSettlement,
  fetchGuestImages,
  createGuestExpense,
  CreateGuestExpenseRequest,
} from '../../api/guest-api';
import { GuestExpenseForm } from './guest-expense-form';
import { GuestExpenseList } from './guest-expense-list';
import { GuestSettlement } from './guest-settlement';
import { GuestMemberList } from './guest-member-list';
import { GuestPhotos } from './guest-photos';
import { Icon, type IconName } from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/PageLoader';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useLanguage } from '../../i18n';

type Tab = 'expenses' | 'settlement' | 'photos' | 'members';

export default function GuestTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { displayName, leave } = useGuest();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<GuestSettlementData | null>(null);
  const [images, setImages] = useState<GuestTripImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof GuestAuthError) {
        leave();
        navigate('/join', { replace: true });
        return true;
      }
      return false;
    },
    [leave, navigate],
  );

  const loadData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);

    try {
      const [tripData, membersData, expensesData, settlementData, imagesData] =
        await Promise.all([
          fetchGuestTrip(tripId),
          fetchGuestMembers(tripId),
          fetchGuestExpenses(tripId),
          fetchGuestSettlement(tripId),
          fetchGuestImages(tripId),
        ]);

      setTrip(tripData);
      setMembers(membersData);
      setExpenses(expensesData);
      setSettlement(settlementData);
      setImages(imagesData);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : 'Failed to load trip data');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, handleAuthError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddExpense = async (expense: CreateGuestExpenseRequest) => {
    if (!tripId) return;
    await createGuestExpense(tripId, expense);
    // Reload expenses and settlement after adding
    const [expensesData, settlementData] = await Promise.all([
      fetchGuestExpenses(tripId),
      fetchGuestSettlement(tripId),
    ]);
    setExpenses(expensesData);
    setSettlement(settlementData);
  };

  const handleReloadImages = async () => {
    if (!tripId) return;
    try {
      const imagesData = await fetchGuestImages(tripId);
      setImages(imagesData);
    } catch (err) {
      console.error('Failed to reload images:', err);
    }
  };

  const handleLeave = () => {
    leave();
    navigate('/join', { replace: true });
  };

  if (loading) {
    return <PageLoader label={t('loadingTrip')} />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error" role="alert">
          <Icon name="alert-circle" />
          <span className="alert-body">{error}</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={loadData}>
          <Icon name="refresh" />
          {t('retry')}
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: IconName }[] = [
    { key: 'expenses', label: t('expensesTab'), icon: 'receipt' },
    { key: 'settlement', label: t('settlementTab'), icon: 'wallet' },
    { key: 'photos', label: t('photosTab'), icon: 'image' },
    { key: 'members', label: t('members'), icon: 'users' },
  ];

  return (
    <main>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{trip?.tripName || t('loadingTrip')}</h1>
          <p className="page-meta">
            {t('loggedInAs')} <strong>{displayName}</strong>
          </p>
        </div>
        <div className="page-actions">
          <LanguageToggle />
          <button type="button" onClick={handleLeave} className="btn btn-secondary btn-sm">
            <Icon name="log-out" size={16} />
            {t('leave')}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs" role="tablist">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`guest-tab-${key}`}
            aria-selected={activeTab === key}
            aria-controls="guest-tabpanel"
            className="tab"
            onClick={() => setActiveTab(key)}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div id="guest-tabpanel" role="tabpanel" aria-labelledby={`guest-tab-${activeTab}`}>
        {activeTab === 'expenses' && (
          <>
            <GuestExpenseForm members={members} onSubmit={handleAddExpense} />
            <GuestExpenseList expenses={expenses} />
          </>
        )}

        {activeTab === 'settlement' && (
          <GuestSettlement settlement={settlement} />
        )}

        {activeTab === 'photos' && tripId && (
          <GuestPhotos tripId={tripId} images={images} onImagesChanged={handleReloadImages} />
        )}

        {activeTab === 'members' && <GuestMemberList members={members} />}
      </div>
    </main>
  );
}
