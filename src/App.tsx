import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
  type CSSProperties,
} from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  LayoutGrid,
  CalendarDays,
  ChartNoAxesCombined,
  Search,
  SlidersHorizontal,
  List,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Music2,
  Cloud,
  Sparkles,
  Check,
  Pause,
  Play,
  Trash2,
  ShieldCheck,
  X,
  CircleHelp,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { LocalizedDialogContent as DialogContent } from '@/components/localized-dialog';
import { useI18n } from '@/components/i18n-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  categories,
  dateString,
  monthlyAmount,
  nextRenewal,
  daysUntil,
  isSubscription,
  sampleSubscriptions,
  type Subscription,
} from '@/lib/subscriptions';
const STORAGE = 'subdock.subscriptions.v1';
const colors: Record<string, string> = {
  影音娱乐: '#8acda8',
  效率工具: '#aeb9f1',
  'AI 助手': '#eccf8e',
  云端存储: '#a3d9ed',
};
function Logo({
  brand,
  name,
  small = false,
}: {
  brand: string;
  name: string;
  small?: boolean;
}) {
  return (
    <span
      className={`service-logo ${brand} ${small ? 'small' : ''}`}
      aria-hidden="true"
    >
      {brand === 'spotify' ? (
        <Music2 />
      ) : brand === 'notion' ? (
        <span className="notion-letter">N</span>
      ) : brand === 'openai' ? (
        <Sparkles />
      ) : brand === 'apple' ? (
        <Cloud />
      ) : brand === 'netflix' ? (
        <b>N</b>
      ) : brand === 'vercel' ? (
        <span className="triangle" />
      ) : (
        <span>{name.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}
function Picker({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v);
      }}
      items={options}
    >
      <SelectTrigger aria-label={label} className="picker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default function Home() {
  const { t, locale } = useI18n();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const shortDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
      date,
    );
  const planLabel = (s: Subscription) =>
    !s.plan || ['月度订阅', '年度订阅'].includes(s.plan)
      ? t(s.cycle === 'monthly' ? '月度订阅' : '年度订阅')
      : s.id.startsWith('sample-')
        ? t(s.plan)
        : s.plan;
  const [today, setToday] = useState(new Date(2026, 8, 5));
  const [items, setItems] = useState<Subscription[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('overview');
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('renewal');
  const [view, setView] = useState('grid');
  const [status, setStatus] = useState('active');
  const [monthOffset, setMonthOffset] = useState(0);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const blank = (): Subscription => ({
    id: '',
    name: '',
    plan: '',
    amount: 0,
    cycle: 'monthly',
    date: dateString(today),
    category: '效率工具',
    brand: 'custom',
    active: true,
    notes: '',
  });
  const [draft, setDraft] = useState<Subscription>(blank);
  // Restore persisted data and the current date after the first render.
  /* eslint-disable react/react-compiler */
  useEffect(() => {
    const now = new Date();
    setToday(now);
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isSubscription))
          throw new Error('invalid');
        setItems(parsed);
      } else setItems(sampleSubscriptions(now));
    } catch {
      setItems(sampleSubscriptions(now));
      setNotice(
        tRef.current('无法读取数据，已载入示例。修改后会尝试重新保存。'),
      );
    }
    setReady(true);
  }, []);
  /* eslint-enable react/react-compiler */
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('subscription-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const commit = (next: Subscription[], message: string) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
      setNotice(message);
    } catch {
      setNotice(t('更改已生效，但未能保存。请稍后重试。'));
    }
  };
  const active = items.filter((s) => s.active);
  const total = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const upcoming = useMemo(
    () =>
      items
        .filter((s) => s.active)
        .map((s) => ({ ...s, next: nextRenewal(s, today) }))
        .sort((a, b) => a.next.getTime() - b.next.getTime()),
    [items, today],
  );
  const nextWeek = upcoming.filter((s) => daysUntil(s.next, today) <= 7);
  const filtered = items
    .filter(
      (s) =>
        (status === 'all' || s.active === (status === 'active')) &&
        (category === '全部' || s.category === category) &&
        `${s.name} ${planLabel(s)}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'amount'
        ? monthlyAmount(b) - monthlyAmount(a)
        : sort === 'name'
          ? a.name.localeCompare(b.name, locale)
          : nextRenewal(a, today).getTime() - nextRenewal(b, today).getTime(),
    );
  const breakdown = categories.map((name) => ({
    name,
    amount: active
      .filter((s) => s.category === name)
      .reduce((sum, s) => sum + monthlyAmount(s), 0),
  }));
  let angle = 0;
  const pie = breakdown
    .map((b) => {
      const from = angle;
      angle += total ? (b.amount / total) * 100 : 0;
      return `${colors[b.name]} ${from}% ${angle}%`;
    })
    .join(', ');
  const month = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );
  const monthEvents = active
    .map((s) => ({ ...s, next: nextRenewal(s, month) }))
    .filter(
      (s) =>
        s.next.getMonth() === month.getMonth() &&
        s.next.getFullYear() === month.getFullYear(),
    );
  const startEdit = (s?: Subscription) => {
    setEditing(s || null);
    setDraft(s ? { ...s } : blank());
    setOpen(true);
  };
  const save = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const s = {
      ...draft,
      id: editing?.id || crypto.randomUUID(),
      name: draft.name.trim(),
      plan: draft.plan.trim(),
    };
    if (!isSubscription(s)) {
      setNotice(t('请填写有效的名称、金额和续费日期。'));
      return;
    }
    commit(
      editing ? items.map((i) => (i.id === s.id ? s : i)) : [...items, s],
      editing ? t('订阅已更新') : t('{name} 已加入你的订阅', { name: s.name }),
    );
    setOpen(false);
  };
  return (
    <div className="app-shell">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <header className="topbar">
          <a className="wordmark" href="/" aria-label={t('Subdock 首页')}>
            <span className="brand-icon">
              <Layers size={23} strokeWidth={2.4} />
            </span>
            subdock
          </a>
          <TabsList className="navigation">
            <TabsTrigger value="overview">
              <LayoutGrid size={16} />
              <span>{t('总览')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays size={16} />
              <span>{t('续费日历')}</span>
            </TabsTrigger>
            <TabsTrigger value="insights">
              <ChartNoAxesCombined size={16} />
              <span>{t('支出洞察')}</span>
            </TabsTrigger>
          </TabsList>
          <div className="header-right">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <span className="local-label">
              <span />
              {t('个人空间')}
            </span>
            <button
              className="avatar"
              onClick={() => setHelp(true)}
              aria-label={t('查看个人空间说明')}
            >
              S
            </button>
          </div>
        </header>
        <main className="main-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {t('YOUR SUBSCRIPTIONS, IN HARMONY')}
              </div>
              <h1>
                {tab === 'calendar'
                  ? t('每次续费，心中有数。')
                  : tab === 'insights'
                    ? t('让每一笔，都值得。')
                    : t('订阅生活，井井有条。')}
              </h1>
              <p>
                {tab === 'calendar'
                  ? t('提前看见下一笔支出，从容安排你的订阅。')
                  : tab === 'insights'
                    ? t('看清开销的去向，把预算留给真正喜欢的事。')
                    : t('把喜欢的服务留在身边，把每一笔开销看得清楚。')}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => startEdit()}
              disabled={!ready}
            >
              <Plus size={18} />
              {t('添加订阅')}
            </button>
          </div>
          <TabsContent value="overview">
            <section className="summary-grid" aria-label={t('订阅概览')}>
              <div className="spend-card">
                <div className="spend-top">
                  <span>
                    <span className="green-dot" />
                    {t('每月订阅支出')}
                  </span>
                  <span className="glass-pill">
                    CNY <ArrowDownLeft size={13} />
                  </span>
                </div>
                <div className="spend-amount">
                  <span>¥</span>
                  {money(total).split('.')[0]}
                  <span className="cents">.{money(total).split('.')[1]}</span>
                </div>
                <p>{t('年付订阅已折算为月均费用')}</p>
                <div className="spend-bottom">
                  <div className="stacked-logos">
                    {active.slice(0, 4).map((s) => (
                      <Logo key={s.id} brand={s.brand} name={s.name} small />
                    ))}
                    <span className="stack-count">
                      {active.length > 4
                        ? `+${active.length - 4}`
                        : active.length}
                    </span>
                  </div>
                  <span>
                    {t('为喜欢的生活买单')}
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <div className="glass-orbit orbit-one" aria-hidden="true" />
                <div className="glass-orbit orbit-two" aria-hidden="true" />
              </div>
              <div className="stats-card">
                <div className="stat-block">
                  <div className="stat-label">
                    {t('正在订阅')}{' '}
                    <span className="mini-icon">
                      <Layers size={17} />
                    </span>
                  </div>
                  <div className="stat-number">
                    {active.length}
                    <span>{t('个服务', { count: active.length })}</span>
                  </div>
                  <div className="stat-note">
                    <span className="green-dot" />
                    {t('{count} 个类别，让生活更丰富', {
                      count: new Set(active.map((s) => s.category)).size,
                    })}
                  </div>
                </div>
                <div className="stat-block">
                  <div className="stat-label">
                    {t('预计年度支出')}
                    <ArrowUpRight size={17} />
                  </div>
                  <div className="stat-number annual">
                    <span className="currency">¥</span>
                    {money(total * 12).split('.')[0]}
                    <span className="annual-cents">
                      .{money(total * 12).split('.')[1]}
                    </span>
                  </div>
                  <div className="stat-note">{t('按当前有效订阅估算')}</div>
                </div>
              </div>
              <div className="renewal-card">
                <div className="section-title">
                  <h2>{t('即将续费')}</h2>
                  <span className="soft-badge">{t('未来 7 天')}</span>
                </div>
                {nextWeek.length ? (
                  <div className="renewals">
                    {nextWeek.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        className="renewal-row"
                        onClick={() => startEdit(s)}
                      >
                        <Logo brand={s.brand} name={s.name} small />
                        <span className="renewal-info">
                          <strong>{s.name}</strong>
                          <span>
                            {daysUntil(s.next, today) === 0
                              ? t('今天')
                              : t('{count} 天后', {
                                  count: daysUntil(s.next, today),
                                })}{' '}
                            · {shortDate(s.next)}
                          </span>
                        </span>
                        <strong className="renewal-price">
                          ¥{money(s.amount)}
                        </strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-renewals">
                    <Check size={24} />
                    <span>{t('这周没有待续费的订阅')}</span>
                  </div>
                )}
                <button
                  className="calendar-link"
                  onClick={() => setTab('calendar')}
                >
                  {t('查看续费日历')}
                  <ArrowRight size={15} />
                </button>
              </div>
            </section>
            <section className="subscriptions-section">
              <div className="list-heading">
                <div>
                  <h2>
                    {t('我的订阅')}
                    <span>{items.length}</span>
                  </h2>
                  <p>{t('那些让日常更美好的小小投资。')}</p>
                </div>
                <div className="list-actions">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      id="subscription-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('搜索订阅…')}
                      aria-label={t('搜索订阅')}
                    />
                    <kbd>⌘ K</kbd>
                  </div>
                  <div className="view-switch" aria-label={t('显示方式')}>
                    <button
                      className={view === 'grid' ? 'selected' : ''}
                      onClick={() => setView('grid')}
                      aria-label={t('卡片视图')}
                      aria-pressed={view === 'grid'}
                    >
                      <LayoutGrid size={17} />
                    </button>
                    <button
                      className={view === 'list' ? 'selected' : ''}
                      onClick={() => setView('list')}
                      aria-label={t('列表视图')}
                      aria-pressed={view === 'list'}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="filter-row">
                <div className="category-filters">
                  {['全部', ...categories].map((c) => (
                    <button
                      key={c}
                      className={category === c ? 'active' : ''}
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                    >
                      {t(c)}
                      {c === '全部' && <span>{items.length}</span>}
                    </button>
                  ))}
                </div>
                <div className="sort-actions">
                  <Picker
                    value={status}
                    onChange={setStatus}
                    label={t('订阅状态')}
                    options={[
                      { value: 'active', label: t('订阅中') },
                      { value: 'paused', label: t('已暂停') },
                      { value: 'all', label: t('全部状态') },
                    ]}
                  />
                  <SlidersHorizontal size={15} />
                  <Picker
                    value={sort}
                    onChange={setSort}
                    label={t('排序方式')}
                    options={[
                      {
                        value: 'renewal',
                        label: t('按续费时间'),
                      },
                      {
                        value: 'amount',
                        label: t('按月均金额'),
                      },
                      { value: 'name', label: t('按名称') },
                    ]}
                  />
                </div>
              </div>
              <div
                className={`subscription-grid ${view === 'list' ? 'list-view' : ''}`}
              >
                {filtered.map((s) => {
                  const next = nextRenewal(s, today);
                  const days = daysUntil(next, today);
                  return (
                    <button
                      className={`subscription-card brand-${s.brand} ${!s.active ? 'paused' : ''}`}
                      key={s.id}
                      onClick={() => startEdit(s)}
                    >
                      <div className="card-top">
                        <Logo brand={s.brand} name={s.name} />
                        <div className="service-heading">
                          <h3>{s.name}</h3>
                          <span>{planLabel(s)}</span>
                        </div>
                        <ArrowUpRight size={17} className="card-arrow" />
                      </div>
                      <div className="card-price">
                        <strong>
                          <span>¥</span>
                          {money(s.amount)}
                        </strong>
                        <span>
                          / {s.cycle === 'monthly' ? t('月') : t('年')}
                        </span>
                        <span
                          className="category-label"
                          style={
                            {
                              '--category-color': colors[s.category],
                            } as CSSProperties
                          }
                        >
                          <i />
                          {t(s.category)}
                        </span>
                      </div>
                      <div className="card-bottom">
                        <span>
                          {!s.active ? (
                            <>
                              <Pause size={12} />
                              {t('已暂停记录')}
                            </>
                          ) : (
                            <>
                              <span
                                className={
                                  days <= 7 ? 'due-dot' : 'neutral-dot'
                                }
                              />
                              {t('{date}续费', { date: shortDate(next) })}
                            </>
                          )}
                        </span>
                        <span
                          className={s.active && days <= 7 ? 'due-badge' : ''}
                        >
                          {!s.active
                            ? t('点击管理')
                            : days === 0
                              ? t('今天')
                              : t('{count} 天后', { count: days })}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {category === '全部' && !query && status === 'active' && (
                  <button className="add-card" onClick={() => startEdit()}>
                    <span className="add-circle">
                      <Plus size={22} />
                    </span>
                    <strong>{t('再添一份喜欢')}</strong>
                    <span>{t('把你的下一个订阅放进来')}</span>
                  </button>
                )}
              </div>
              {!filtered.length && (
                <div className="empty-result">
                  <Search size={25} />
                  <h3>{query ? t('没有找到这个订阅') : t('这里还没有订阅')}</h3>
                  <p>{t('试试其他分类，或添加一个新的订阅。')}</p>
                  <button
                    onClick={() => {
                      setCategory('全部');
                      setQuery('');
                      setStatus('all');
                    }}
                    className="text-button"
                  >
                    {t('查看全部订阅')}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
            <div className="gentle-note">
              <span className="note-icon">
                <Sparkles size={17} />
              </span>
              <p>
                <strong>{t('少一点无意识的续费，多一点有意识的喜欢。')}</strong>
                <span>{t('定期回顾你的订阅，把空间留给真正重要的事。')}</span>
              </p>
              <span className="note-mark">
                {t('make room for what matters.')}
              </span>
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <section className="calendar-surface">
              <div className="calendar-heading">
                <div>
                  <h2>
                    {new Intl.DateTimeFormat(locale, {
                      year: 'numeric',
                      month: 'long',
                    }).format(month)}
                  </h2>
                  <p>
                    {t('{count} 笔续费 · 合计 {amount}', {
                      count: monthEvents.length,
                      amount:
                        '¥' +
                        money(monthEvents.reduce((n, s) => n + s.amount, 0)),
                    })}
                  </p>
                </div>
                <div className="calendar-controls">
                  <button
                    aria-label={t('上个月')}
                    onClick={() => setMonthOffset((n) => n - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setMonthOffset(0)}>{t('本月')}</button>
                  <button
                    aria-label={t('下个月')}
                    onClick={() => setMonthOffset((n) => n + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="calendar-grid">
                {Array.from({ length: 7 }, (_, i) =>
                  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                    new Date(2026, 0, 4 + i),
                  ),
                ).map((d) => (
                  <div className="weekday" key={d}>
                    {d}
                  </div>
                ))}
                {Array.from({ length: month.getDay() }, (_, i) => (
                  <div className="calendar-cell blank" key={`blank-${i}`} />
                ))}
                {Array.from(
                  {
                    length: new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      0,
                    ).getDate(),
                  },
                  (_, i) => {
                    const day = i + 1;
                    const events = monthEvents.filter(
                      (s) => s.next.getDate() === day,
                    );
                    return (
                      <div
                        className={`calendar-cell ${dateString(new Date(month.getFullYear(), month.getMonth(), day)) === dateString(today) ? 'today' : ''}`}
                        key={day}
                      >
                        <span className="day-number">{day}</span>
                        {events.map((s) => (
                          <button
                            className="calendar-event"
                            key={s.id}
                            onClick={() => startEdit(s)}
                            title={`${s.name} ¥${money(s.amount)}`}
                          >
                            <Logo brand={s.brand} name={s.name} small />
                            <span>
                              {s.name}
                              <small>¥{money(s.amount)}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  },
                )}
              </div>
              <p className="calendar-caption">
                {t('根据当前订阅的续费周期推算，不代表已实际扣款。')}
              </p>
            </section>
          </TabsContent>
          <TabsContent value="insights">
            <section className="insights-surface">
              <div className="insight-title">
                <span className="eyebrow">{t('THE BIGGER PICTURE')}</span>
                <h2>{t('你的喜欢，各有所占。')}</h2>
                <p>{t('按月均费用，了解每一类订阅的占比。')}</p>
              </div>
              <div className="insights-content">
                <div
                  className="donut"
                  style={{
                    background: total ? `conic-gradient(${pie})` : '#e9eae7',
                  }}
                >
                  <div>
                    <span>{t('每月合计')}</span>
                    <strong>¥{money(total)}</strong>
                    <small>
                      {t('{count} 个有效订阅', { count: active.length })}
                    </small>
                  </div>
                </div>
                <div className="breakdown">
                  {breakdown.map((b) => (
                    <div className="breakdown-row" key={b.name}>
                      <div>
                        <span>
                          <i style={{ background: colors[b.name] }} />
                          {t(b.name)}
                        </span>
                        <strong>
                          ¥{money(b.amount)}{' '}
                          <small>
                            {total ? Math.round((b.amount / total) * 100) : 0}%
                          </small>
                        </strong>
                      </div>
                      <div className="bar-track">
                        <div
                          style={{
                            width: `${total ? (b.amount / total) * 100 : 0}%`,
                            background: colors[b.name],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="insight-foot">
                <span>
                  <ShieldCheck size={18} />
                  {t('仅统计有效订阅，年付费用按 12 个月均摊。')}
                </span>
                <strong>
                  {t('年度预计 {amount}', { amount: '¥' + money(total * 12) })}
                </strong>
              </div>
            </section>
          </TabsContent>
          <footer>
            <span>
              <Layers size={15} />
              {t('subdock · 为每一份喜欢，找到归处。')}
            </span>
            <button onClick={() => setHelp(true)}>
              <ShieldCheck size={14} />
              {t('使用说明')}
              <CircleHelp size={13} />
            </button>
          </footer>
        </main>
      </Tabs>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="subscription-dialog">
          <DialogTitle>
            {editing ? t('管理订阅') : t('添加一份喜欢')}
          </DialogTitle>
          <DialogDescription>
            {t('记录订阅费用与续费日期，所有金额均以人民币计。')}
          </DialogDescription>
          <form onSubmit={save} className="subscription-form">
            <div className="form-brand">
              <Logo brand={draft.brand} name={draft.name || 'S'} />
              <div>
                <strong>{draft.name || t('新的订阅')}</strong>
                <span>
                  {editing
                    ? t('让每一份订阅都值得')
                    : t('从这里开始，井井有条')}
                </span>
              </div>
            </div>
            <label>
              {t('服务名称')}
              <input
                required
                maxLength={60}
                placeholder={t('例如 Spotify、Notion')}
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const brands: Record<string, string> = {
                    spotify: 'spotify',
                    notion: 'notion',
                    chatgpt: 'openai',
                    'apple icloud+': 'apple',
                    netflix: 'netflix',
                    vercel: 'vercel',
                  };
                  setDraft({
                    ...draft,
                    name,
                    brand: brands[name.toLowerCase()] || 'custom',
                  });
                }}
              />
            </label>
            <label>
              {t('套餐名称')}
              <input
                maxLength={80}
                placeholder={t('例如 Premium 个人')}
                value={
                  editing?.id.startsWith('sample-') ? t(draft.plan) : draft.plan
                }
                onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
              />
            </label>
            <div className="form-columns">
              <label>
                {t('金额（CNY）')}
                <input
                  type="number"
                  min="0.01"
                  max="10000000"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={draft.amount || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: Number(e.target.value) })
                  }
                />
              </label>
              <div className="form-field">
                <span>{t('付款周期')}</span>
                <Picker
                  label={t('付款周期')}
                  value={draft.cycle}
                  onChange={(v) =>
                    setDraft({ ...draft, cycle: v as Subscription['cycle'] })
                  }
                  options={[
                    { value: 'monthly', label: t('每月') },
                    { value: 'yearly', label: t('每年') },
                  ]}
                />
              </div>
            </div>
            <div className="form-columns">
              <label>
                {t('下一次续费')}
                <input
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  required
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <div className="form-field">
                <span>{t('分类')}</span>
                <Picker
                  label={t('分类')}
                  value={draft.category}
                  onChange={(v) => setDraft({ ...draft, category: v })}
                  options={categories.map((c) => ({ value: c, label: t(c) }))}
                />
              </div>
            </div>
            <label>
              {t('备注')}
              <span className="optional">{t('选填')}</span>
              <input
                maxLength={300}
                placeholder={t('给未来的自己留个提醒')}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>
            <button type="submit" className="primary-button save-button">
              <Check size={17} />
              {editing ? t('保存更改') : t('添加订阅')}
            </button>
            {editing && (
              <div className="edit-actions">
                <button
                  type="button"
                  onClick={() => {
                    commit(
                      items.map((s) =>
                        s.id === editing.id ? { ...s, active: !s.active } : s,
                      ),
                      editing.active
                        ? t('已暂停记录；实际订阅请前往服务商取消。')
                        : t('已恢复订阅记录'),
                    );
                    setOpen(false);
                  }}
                >
                  {editing.active ? <Pause size={15} /> : <Play size={15} />}{' '}
                  {editing.active ? t('暂停记录') : t('恢复记录')}
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setRemoveId(editing.id);
                  }}
                >
                  <Trash2 size={15} />
                  {t('删除')}
                </button>
              </div>
            )}
            <p className="form-disclaimer">
              {t('Subdock 仅管理记录，不会创建或取消服务商的实际订阅。')}
            </p>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!removeId}
        onOpenChange={(v) => {
          if (!v) setRemoveId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>{t('删除这条订阅记录？')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('这条记录会被移除，实际订阅不会取消。')}
          </AlertDialogDescription>
          <div className="confirm-actions">
            <AlertDialogCancel>{t('保留记录')}</AlertDialogCancel>
            <button
              className="primary-button danger"
              onClick={() => {
                commit(
                  items.filter((s) => s.id !== removeId),
                  t('订阅记录已删除'),
                );
                setRemoveId(null);
              }}
            >
              {t('删除记录')}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="help-dialog">
          <DialogTitle>{t('你的个人订阅空间')}</DialogTitle>
          <DialogDescription>{t('清晰记录，安心管理。')}</DialogDescription>
          <ShieldCheck size={32} />
          <p>
            {t(
              '首次打开时显示的是可编辑的示例数据，费用不代表服务商的实时定价。',
            )}
          </p>
          <p>
            {t(
              '续费日期是根据你填写的周期推算的，目前不发送系统通知，也不连接支付账户。',
            )}
          </p>
        </DialogContent>
      </Dialog>
      <output
        className={`toast-message ${notice ? 'visible' : ''}`}
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={17} />
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label={t('关闭提示')}>
              <X size={15} />
            </button>
          </>
        )}
      </output>
    </div>
  );
}
