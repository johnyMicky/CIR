import React, { useMemo, useState } from 'react';

type Asset = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
};

const assetsSeed: Asset[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', amount: 0.1842, price: 84250.32, change24h: 2.14 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', amount: 2.9134, price: 4378.18, change24h: 1.26 },
  { id: '3', symbol: 'USDT', name: 'Tether', amount: 5820.0, price: 1.0, change24h: 0.0 },
  { id: '4', symbol: 'SOL', name: 'Solana', amount: 41.21, price: 188.42, change24h: -0.82 },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function App() {
  const [hidden, setHidden] = useState(false);

  const totalBalance = useMemo(() => {
    return assetsSeed.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Axcel Private Wallet</div>
            <h1 style={styles.title}>Secure Digital Vault</h1>
          </div>

          <button style={styles.profileBtn}>AP</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.label}>Total Portfolio Value</div>
              <div style={styles.balance}>
                {hidden ? '••••••••' : formatMoney(totalBalance)}
              </div>
            </div>

            <button style={styles.secondaryBtn} onClick={() => setHidden(!hidden)}>
              {hidden ? 'Show' : 'Hide'}
            </button>
          </div>

          <div style={styles.actions}>
            <button style={styles.primaryBtn}>Send</button>
            <button style={styles.secondaryBtn}>Receive</button>
            <button style={styles.secondaryBtn}>Swap</button>
          </div>
        </div>

        <div style={styles.sectionTitle}>Your Assets</div>

        <div style={styles.list}>
          {assetsSeed.map((asset) => {
            const value = asset.amount * asset.price;
            const positive = asset.change24h >= 0;

            return (
              <div key={asset.id} style={styles.assetCard}>
                <div>
                  <div style={styles.assetName}>{asset.name}</div>
                  <div style={styles.assetMeta}>
                    {asset.symbol} • {hidden ? '••••' : asset.amount}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={styles.assetValue}>
                    {hidden ? '••••••••' : formatMoney(value)}
                  </div>
                  <div
                    style={{
                      ...styles.assetChange,
                      color: positive ? '#35d49a' : '#ff6b7a',
                    }}
                  >
                    {positive ? '+' : ''}
                    {asset.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#07111f',
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  eyebrow: {
    color: '#7f93bf',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  title: {
    color: '#f3f7ff',
    margin: 0,
    fontSize: '32px',
  },
  profileBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid #1c3a63',
    background: '#11233b',
    color: '#7ce3ff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  card: {
    background: '#0d1c31',
    border: '1px solid #18304f',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '20px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  label: {
    color: '#8ba0c8',
    fontSize: '13px',
    marginBottom: '8px',
  },
  balance: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 800,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: '#1ac8ff',
    color: '#041220',
    border: 'none',
    borderRadius: '14px',
    padding: '12px 18px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: '#13253f',
    color: '#d6e8ff',
    border: '1px solid #21456f',
    borderRadius: '14px',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  sectionTitle: {
    color: '#f4f8ff',
    fontSize: '22px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  list: {
    display: 'grid',
    gap: '12px',
  },
  assetCard: {
    background: '#0d1c31',
    border: '1px solid #18304f',
    borderRadius: '20px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetName: {
    color: '#f4f8ff',
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  assetMeta: {
    color: '#7e93bb',
    fontSize: '13px',
  },
  assetValue: {
    color: '#f4f8ff',
    fontSize: '16px',
    fontWeight: 800,
    marginBottom: '4px',
  },
  assetChange: {
    fontSize: '13px',
    fontWeight: 700,
  },
};
