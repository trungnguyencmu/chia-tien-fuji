import { TripMember } from '../../api/guest-api';

interface GuestMemberListProps {
  members: TripMember[];
}

const roleBadgeClass: Record<string, string> = {
  owner: 'badge badge-success',
  member: 'badge badge-neutral',
  guest: 'badge badge-warning',
};

export function GuestMemberList({ members }: GuestMemberListProps) {
  if (members.length === 0) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
          👥 Members
        </h2>
        <div className="empty-state">
          <div className="empty-state-icon">🤷</div>
          <p>No members found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
          👥 Members
        </h2>
        <div className="badge badge-neutral">{members.length} members</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Joined</th>
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
                <td>{new Date(m.joinedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
