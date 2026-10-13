import { TripMember } from '../../api/guest-api';
import { Icon } from '../../components/ui/Icon';
import { useLanguage } from '../../i18n';

interface GuestMemberListProps {
  members: TripMember[];
}

const roleBadgeClass: Record<string, string> = {
  owner: 'badge badge-success',
  member: 'badge badge-neutral',
  guest: 'badge badge-warning',
};

export function GuestMemberList({ members }: GuestMemberListProps) {
  const { t } = useLanguage();
  if (members.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <Icon name="users" size={22} />
          {t('members')}
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="user" size={26} />
          </div>
          <p>{t('noMembersFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Icon name="users" size={22} />
          {t('members')}
        </h2>
        <div className="badge badge-neutral">{members.length} members</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('role')}</th>
              <th>{t('joined')}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId}>
                <td>
                  <strong>{m.displayName}</strong>
                </td>
                <td>
                  <span className={roleBadgeClass[m.role] || 'badge badge-neutral'}>
                    {m.role}
                  </span>
                </td>
                <td className="tabular">{new Date(m.joinedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
