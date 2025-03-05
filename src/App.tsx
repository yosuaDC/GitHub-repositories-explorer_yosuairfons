import React, { useState } from 'react';

interface User {
  login: string;
  id: number;
}

interface Repository {
  name: string;
  stargazers_count: number;
  description: string;
}

const UserSearch: React.FC = () => {
  const [username, setUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [repositories, setRepositories] = useState<{ [key: string]: Repository[] }>({});
  const [openUser, setOpenUser] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`https://api.github.com/search/users?q=${username}`);
      const data = await response.json();
      if (response.ok) {
        setFilteredUsers(data.items);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async (username: string) => {
    if (repositories[username]) return;
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const data = await response.json();
      if (response.ok) {
        setRepositories(prev => ({ ...prev, [username]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch repositories');
    }
  };

  const toggleUser = (username: string) => {
    const isOpen = openUser === username;
    setOpenUser(isOpen ? null : username);
    if (!isOpen) fetchRepositories(username);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <input
          type="text"
          style={{ width: '97%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          placeholder="Exampleuser"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          style={{ width: '100%', padding: '8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {filteredUsers.map(user => (
          <div key={user.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px', marginTop: '10px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleUser(user.login)}
            >
              {user.login}
              <span>{openUser === user.login ? '▲' : '▼'}</span>
            </div>
            {openUser === user.login && repositories[user.login]?.map(repo => (
              <div key={repo.name} style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{repo.name}</strong>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor">
                      <path d="M8 12.026l3.472 2.117-.944-4.08 3.188-2.746-4.217-.364L8 .25 6.501 6.953l-4.217.364 3.188 2.746-.944 4.08L8 12.026z"/>
                    </svg>
                    {repo.stargazers_count}
                  </span>
                </div>
                <p style={{ margin: '5px 0' }}>{repo.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
