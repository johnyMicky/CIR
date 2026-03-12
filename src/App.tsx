import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';

type Asset = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
};

type Activity = {
  id: string;
  type: 'Received' | 'Sent' | 'Swap' | 'Buy';
  title: string;
  subtitle: string;
  amount: string;
  time: string;
};

const assetsSeed: Asset[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', amount: 0.1842, price: 84250.32, change24h: 2.14 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', amount: 2.9134, price: 4378.18, change24h: 1.26 },
  { id: '3', symbol: 'USDT', name: 'Tether', amount: 5820.0, price: 1.0, change24h: 0.0 },
  { id: '4', symbol: 'SOL', name: 'Solana', amount: 41.21, price: 188.42, change24h: -0.82 },
];

const activitySeed: Activity[] = [
  {
    id: 'a1',
    type: 'Received',
    title: 'Incoming transfer',
    subtitle: '0x7A...12B9',
    amount: '+0.024 BTC',
    time: 'Today • 14:32',
  },
  {
    id: 'a2',
    type: 'Swap',
    title: 'Swapped ETH to USDT',
    subtitle: 'Completed securely',
    amount: '1.25 ETH',
    time: 'Today • 10:11',
  },
  {
    id: 'a3',
    type: 'Sent',
    title: 'Sent to whitelist address',
    subtitle: '0x9F...C0A1',
    amount: '-850 USDT',
    time: 'Yesterday • 22:03',
  },
  {
    id: 'a4',
    type: 'Buy',
    title: 'Card purchase',
    subtitle: 'SOL acquired',
    amount: '+12.0 SOL',
    time: 'Yesterday • 17:45',
  },
];

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const maskBalance = (value: string) => '••••••••';

export default function App() {
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Assets' | 'Activity' | 'Settings'>('Overview');
  const [search, setSearch] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const totalBalance = useMemo(() => {
    return assetsSeed.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  }, []);

  const dailyPnl = useMemo(() => {
    return assetsSeed.reduce((sum, asset) => {
      const currentValue = asset.amount * asset.price;
      const previousValue = currentValue / (1 + asset.change24h / 100);
      return sum + (currentValue - previousValue);
    }, 0);
  }, []);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return assetsSeed;
    return assetsSeed.filter(
      asset =>
        asset.name.toLowerCase().includes(term) ||
        asset.symbol.toLowerCase().includes(term)
    );
  }, [search]);

  const actionAlert = (title: string) => {
    Alert.alert(title, `${title} flow will be connected to secure wallet actions.`);
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.eyebrow}>Axcel Private Wallet</Text>
        <Text style={styles.mainTitle}>Secure Digital Vault</Text>
      </View>

      <TouchableOpacity
        style={styles.profilePill}
        onPress={() => Alert.alert('Profile', 'Profile settings screen can be linked next.')}
        activeOpacity={0.85}
      >
        <Text style={styles.profilePillText}>AP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTopRow}>
        <View>
          <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
          <Text style={styles.balanceValue}>
            {balancesHidden ? maskBalance(formatMoney(totalBalance)) : formatMoney(totalBalance)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setBalancesHidden(!balancesHidden)}
          style={styles.hideButton}
          activeOpacity={0.85}
        >
          <Text style={styles.hideButtonText}>{balancesHidden ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceStatsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>24h P/L</Text>
          <Text style={[styles.statValue, dailyPnl >= 0 ? styles.positiveText : styles.negativeText]}>
            {dailyPnl >= 0 ? '+' : '-'}
            {formatMoney(Math.abs(dailyPnl))}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Assets</Text>
          <Text style={styles.statValue}>{assetsSeed.length}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Security</Text>
          <Text style={styles.statValue}>High</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryAction} onPress={() => actionAlert('Send')} activeOpacity={0.9}>
          <Text style={styles.primaryActionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={() => actionAlert('Receive')} activeOpacity={0.9}>
          <Text style={styles.secondaryActionText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={() => actionAlert('Swap')} activeOpacity={0.9}>
          <Text style={styles.secondaryActionText}>Swap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
    const renderQuickInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Insights</Text>

      <View style={styles.insightsGrid}>
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Cold Shield</Text>
          <Text style={styles.insightValue}>Enabled</Text>
          <Text style={styles.insightSubtext}>Private key protection active</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Risk Monitor</Text>
          <Text style={styles.insightValue}>Stable</Text>
          <Text style={styles.insightSubtext}>No unusual wallet events</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Backup Status</Text>
          <Text style={styles.insightValue}>Synced</Text>
          <Text style={styles.insightSubtext}>Recovery phrase secured</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Whitelist</Text>
          <Text style={styles.insightValue}>4 Saved</Text>
          <Text style={styles.insightSubtext}>Trusted destination addresses</Text>
        </View>
      </View>
    </View>
  );

  const renderAssetCard = (asset: Asset) => {
    const value = asset.amount * asset.price;
    const isPositive = asset.change24h >= 0;

    return (
      <View key={asset.id} style={styles.assetCard}>
        <View style={styles.assetLeft}>
          <View style={styles.assetIcon}>
            <Text style={styles.assetIconText}>{asset.symbol.slice(0, 1)}</Text>
          </View>

          <View>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetSymbol}>
              {asset.symbol} • {balancesHidden ? '••••' : asset.amount.toFixed(asset.symbol === 'USDT' ? 2 : 4)}
            </Text>
          </View>
        </View>

        <View style={styles.assetRight}>
          <Text style={styles.assetValue}>
            {balancesHidden ? maskBalance(formatMoney(value)) : formatMoney(value)}
          </Text>
          <Text style={[styles.assetChange, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}
            {asset.change24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderAssetsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Your Assets</Text>
        <Text style={styles.sectionAction}>Manage</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search asset"
          placeholderTextColor="#6e7ea6"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {filteredAssets.map(renderAssetCard)}

      {filteredAssets.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No assets found</Text>
          <Text style={styles.emptyText}>Try another symbol or asset name.</Text>
        </View>
      )}
    </View>
  );

  const renderActivityItem = (item: Activity) => {
    const isPositive = item.amount.startsWith('+');

    return (
      <View key={item.id} style={styles.activityCard}>
        <View style={styles.activityBadge}>
          <Text style={styles.activityBadgeText}>{item.type.slice(0, 1)}</Text>
        </View>

        <View style={styles.activityMiddle}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>

        <View style={styles.activityRight}>
          <Text style={[styles.activityAmount, isPositive ? styles.positiveText : styles.negativeText]}>
            {item.amount}
          </Text>
        </View>
      </View>
    );
  };

  const renderActivitySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionAction}>View all</Text>
      </View>

      {activitySeed.map(renderActivityItem)}
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings & Security</Text>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Price alerts and security events</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Biometric Lock</Text>
            <Text style={styles.settingSubtitle}>Face ID / fingerprint authentication</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
        </View>

        <View style={styles.settingDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => Alert.alert('Backup', 'Secure backup workflow can be added next.')}
          activeOpacity={0.85}
        >
          <Text style={styles.menuRowTitle}>Recovery Phrase Backup</Text>
          <Text style={styles.menuRowArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => Alert.alert('Whitelist', 'Trusted addresses screen can be linked next.')}
          activeOpacity={0.85}
        >
          <Text style={styles.menuRowTitle}>Address Whitelist</Text>
          <Text style={styles.menuRowArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => Alert.alert('Support', 'Private support center can be connected here.')}
          activeOpacity={0.85}
        >
          <Text style={styles.menuRowTitle}>Private Support</Text>
          <Text style={styles.menuRowArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
    const renderOverviewTab = () => (
    <>
      {renderBalanceCard()}
      {renderQuickInsights()}
      {renderAssetsSection()}
      {renderActivitySection()}
    </>
  );

  const renderAssetsTab = () => (
    <>
      {renderBalanceCard()}
      {renderAssetsSection()}
    </>
  );

  const renderActivityTab = () => (
    <>
      {renderBalanceCard()}
      {renderActivitySection()}
    </>
  );

  const renderSettingsTab = () => (
    <>
      {renderBalanceCard()}
      {renderSettingsSection()}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Assets':
        return renderAssetsTab();
      case 'Activity':
        return renderActivityTab();
      case 'Settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  const TabButton = ({
    label,
  }: {
    label: 'Overview' | 'Assets' | 'Activity' | 'Settings';
  }) => {
    const active = activeTab === label;

    return (
      <TouchableOpacity
        style={[styles.tabButton, active && styles.activeTabButton]}
        onPress={() => setActiveTab(label)}
        activeOpacity={0.9}
      >
        <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderContent()}
        </ScrollView>

        <View style={styles.bottomTabBar}>
          <TabButton label="Overview" />
          <TabButton label="Assets" />
          <TabButton label="Activity" />
          <TabButton label="Settings" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  container: {
    flex: 1,
    backgroundColor: '#07111f',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#7f93bf',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mainTitle: {
    color: '#f3f7ff',
    fontSize: 26,
    fontWeight: '800',
  },
  profilePill: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#11233b',
    borderWidth: 1,
    borderColor: '#1c3a63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePillText: {
    color: '#7ce3ff',
    fontWeight: '800',
    fontSize: 15,
  },
  balanceCard: {
    backgroundColor: '#0d1c31',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#18304f',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  balanceLabel: {
    color: '#8ba0c8',
    fontSize: 13,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  hideButton: {
    backgroundColor: '#142844',
    borderWidth: 1,
    borderColor: '#21456f',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  hideButtonText: {
    color: '#9fd8ff',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#0a1627',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#6f84ac',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#eff5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#1a2b45',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
    primaryAction: {
    flex: 1,
    backgroundColor: '#1ac8ff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#041220',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#13253f',
    borderWidth: 1,
    borderColor: '#21456f',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#d6e8ff',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#f4f8ff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionAction: {
    color: '#7bd8ff',
    fontSize: 13,
    fontWeight: '700',
  },
  insightsGrid: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#0d1c31',
    borderWidth: 1,
    borderColor: '#18304f',
    borderRadius: 20,
    padding: 16,
  },
  insightLabel: {
    color: '#87a0c8',
    fontSize: 12,
    marginBottom: 8,
  },
  insightValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  insightSubtext: {
    color: '#7388ae',
    fontSize: 13,
    lineHeight: 18,
  },
  searchBox: {
    backgroundColor: '#0d1c31',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#18304f',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    color: '#f3f7ff',
    height: 48,
    fontSize: 15,
  },
  assetCard: {
    backgroundColor: '#0d1c31',
    borderWidth: 1,
    borderColor: '#18304f',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#132946',
    borderWidth: 1,
    borderColor: '#23446c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: {
    color: '#82ddff',
    fontWeight: '800',
    fontSize: 16,
  },
  assetName: {
    color: '#f4f8ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetSymbol: {
    color: '#7e93bb',
    fontSize: 13,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetValue: {
    color: '#f4f8ff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  assetChange: {
    fontSize: 13,
    fontWeight: '700',
  },
  positiveText: {
    color: '#35d49a',
  },
  negativeText: {
    color: '#ff6b7a',
  },
  emptyBox: {
    backgroundColor: '#0d1c31',
    borderWidth: 1,
    borderColor: '#18304f',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#f3f7ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#7d90b5',
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: '#0d1c31',
    borderWidth: 1,
    borderColor: '#18304f',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#142844',
    borderWidth: 1,
    borderColor: '#22466f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityBadgeText: {
    color: '#8adfff',
    fontSize: 15,
    fontWeight: '800',
  },
  activityMiddle: {
    flex: 1,
  },
  activityTitle: {
    color: '#f2f7ff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  activitySubtitle: {
    color: '#8093b9',
    fontSize: 13,
    marginBottom: 4,
  },
  activityTime: {
    color: '#6880aa',
    fontSize: 12,
  },
  activityRight: {
    marginLeft: 12,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: '#0d1c31',
    borderWidth: 1,
    borderColor: '#18304f',
    borderRadius: 22,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingTitle: {
    color: '#f4f8ff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingSubtitle: {
    color: '#7e93bb',
    fontSize: 13,
    maxWidth: 240,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#1a2b45',
    marginVertical: 14,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuRowTitle: {
    color: '#f3f7ff',
    fontSize: 15,
    fontWeight: '700',
  },
  menuRowArrow: {
    color: '#88ddff',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '700',
  },
  bottomTabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    backgroundColor: '#0b1728',
    borderWidth: 1,
    borderColor: '#19314f',
    borderRadius: 22,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#173253',
  },
  tabButtonText: {
    color: '#7e93bb',
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabButtonText: {
    color: '#8de5ff',
  },
});
