import { useState, useReducer, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "card_game_tracker_v1";

// ─── Data Helpers ─────────────────────────────────────────────────────────────
function createPlayer(id, name) {
  return { id, name, balance: 0, transactions: [] };
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function initialState() {
  return { step: "setup", playerCount: 2, players: [] };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "SET_PLAYER_COUNT":
      return { ...state, playerCount: action.count };

    case "INIT_PLAYERS": {
      const players = Array.from({ length: state.playerCount }, (_, i) =>
        createPlayer(i, `Player ${i + 1}`)
      );
      return { ...state, players, step: "names" };
    }

    case "SET_NAME": {
      const players = state.players.map((p) =>
        p.id === action.id ? { ...p, name: action.name } : p
      );
      return { ...state, players };
    }

    case "START_GAME":
      return { ...state, step: "game" };

    case "SET_BALANCE": {
      const players = state.players.map((p) =>
        p.id === action.id ? { ...p, balance: action.balance } : p
      );
      return { ...state, players };
    }

    case "TRANSFER": {
      const { fromId, toId, amount, note } = action;
      const fromPlayer = state.players.find((p) => p.id === fromId);
      const toPlayer = state.players.find((p) => p.id === toId);
      if (!fromPlayer || !toPlayer || amount === 0) return state;
      const ts = new Date().toISOString();
      const txId = makeId();
      const players = state.players.map((p) => {
        if (p.id === fromId) {
          return {
            ...p,
            balance: p.balance - amount,
            transactions: [
              { id: txId, type: "debit", amount, withId: toId, withName: toPlayer.name, note: note || "", ts },
              ...p.transactions,
            ],
          };
        }
        if (p.id === toId) {
          return {
            ...p,
            balance: p.balance + amount,
            transactions: [
              { id: txId, type: "credit", amount, withId: fromId, withName: fromPlayer.name, note: note || "", ts },
              ...p.transactions,
            ],
          };
        }
        return p;
      });
      return { ...state, players };
    }

    case "END_GAME":
      return { ...state, step: "results" };

    case "RESET": {
      const fresh = initialState();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch {}
      return fresh;
    }

    case "LOAD":
      return action.state;

    default:
      return state;
  }
}

// ─── Persist Hook ─────────────────────────────────────────────────────────────
function usePersist(state, dispatch) {
  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "LOAD", state: JSON.parse(saved) });
    } catch {}
  }, []);

  // Save on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);
}

// ─── Settle Debts Algorithm ───────────────────────────────────────────────────
function settleDebts(players) {
  const creds = players.filter((p) => p.balance > 0).map((p) => ({ ...p, bal: p.balance })).sort((a, b) => b.bal - a.bal);
  const debts = players.filter((p) => p.balance < 0).map((p) => ({ ...p, bal: p.balance })).sort((a, b) => a.bal - b.bal);
  const txns = [];
  let ci = 0, di = 0;
  while (ci < creds.length && di < debts.length) {
    const amt = Math.min(creds[ci].bal, -debts[di].bal);
    txns.push({ from: debts[di].name, to: creds[ci].name, amount: Math.round(amt) });
    creds[ci].bal -= amt;
    debts[di].bal += amt;
    if (Math.abs(creds[ci].bal) < 0.01) ci++;
    if (Math.abs(debts[di].bal) < 0.01) di++;
  }
  return txns;
}

// ─── Reset Button (Persistent — survives page refresh) ────────────────────────
function ResetButton({ dispatch }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500 font-semibold">Reset game?</span>
        <button
          onClick={() => { dispatch({ type: "RESET" }); setConfirm(false); }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="Reset Game"
      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center text-base transition"
      aria-label="Reset game"
    >
      ↺
    </button>
  );
}

// ─── Step Dots ────────────────────────────────────────────────────────────────
function StepDots({ step }) {
  const steps = ["setup", "names", "game", "results"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex gap-2 justify-center mb-6">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`w-2.5 h-2.5 rounded-full transition-all ${i <= idx ? "bg-indigo-500" : "bg-gray-300"}`}
        />
      ))}
    </div>
  );
}

// ─── Amount Input ─────────────────────────────────────────────────────────────
function AmountInput({ value, onChange, step = 5 }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(value - step)}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 font-bold flex items-center justify-center text-lg transition select-none"
        aria-label="Decrease"
      >−</button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Balance"
      />
      <button
        onClick={() => onChange(value + step)}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-600 font-bold flex items-center justify-center text-lg transition select-none"
        aria-label="Increase"
      >+</button>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ state, dispatch }) {
  const counts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">🃏</div>
        <h1 className="text-2xl font-bold text-gray-800">Card Game Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">Track balances, transfers & who owes whom</p>
      </div>
      <StepDots step={state.step} />
      <div className="w-full bg-white rounded-2xl shadow p-6">
        <label className="block text-sm font-semibold text-gray-600 mb-3">Number of Players</label>
        <div className="grid grid-cols-4 gap-2">
          {counts.map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: "SET_PLAYER_COUNT", count: n })}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                state.playerCount === n
                  ? "bg-indigo-500 text-white border-indigo-500 shadow"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: "INIT_PLAYERS" })}
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow text-base"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Names Screen ─────────────────────────────────────────────────────────────
function NamesScreen({ state, dispatch }) {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-gray-800">Enter Player Names</h2>
          <p className="text-gray-400 text-sm">{state.playerCount} players</p>
        </div>
        <ResetButton dispatch={dispatch} />
      </div>
      <StepDots step={state.step} />
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
        {state.players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </div>
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder={`Player ${i + 1}`}
              value={p.name}
              onChange={(e) => dispatch({ type: "SET_NAME", id: p.id, name: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: "SET_STEP", step: "setup" })}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl active:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => dispatch({ type: "START_GAME" })}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-3 rounded-2xl shadow"
        >
          Start Game →
        </button>
      </div>
    </div>
  );
}

// ─── Player Profile Modal ─────────────────────────────────────────────────────
function PlayerProfile({ player, allPlayers, dispatch, onClose }) {
  const [transferAmount, setTransferAmount] = useState(50);
  const [note, setNote] = useState("");
  const others = allPlayers.filter((p) => p.id !== player.id);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-gray-800">{player.name}</div>
            <div className={`text-2xl font-bold ${player.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {player.balance >= 0 ? "+" : ""}{player.balance}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg">✕</button>
        </div>

        {/* Transfer */}
        <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
          <div className="text-sm font-semibold text-indigo-700 mb-3">💸 Transfer Money</div>
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">Amount</label>
            <AmountInput value={transferAmount} onChange={setTransferAmount} />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g. round 3 pot"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1">{player.name} RECEIVES from:</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {others.map((o) => (
              <button
                key={o.id}
                onClick={() => { dispatch({ type: "TRANSFER", fromId: o.id, toId: player.id, amount: transferAmount, note }); setNote(""); }}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs rounded-xl font-semibold"
              >
                ← {o.name}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-1">{player.name} PAYS to:</div>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <button
                key={o.id}
                onClick={() => { dispatch({ type: "TRANSFER", fromId: player.id, toId: o.id, amount: transferAmount, note }); setNote(""); }}
                className="px-3 py-1.5 bg-red-400 hover:bg-red-500 active:bg-red-600 text-white text-xs rounded-xl font-semibold"
              >
                → {o.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Balance */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="text-sm font-semibold text-gray-600 mb-2">✏️ Adjust Balance Directly</div>
          <AmountInput
            value={player.balance}
            onChange={(val) => dispatch({ type: "SET_BALANCE", id: player.id, balance: val })}
          />
        </div>

        {/* Transactions */}
        <div>
          <div className="text-sm font-semibold text-gray-600 mb-2">📋 Transactions</div>
          {player.transactions.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">No transactions yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {player.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                  <div>
                    <span className={tx.type === "credit" ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                      {tx.type === "credit" ? `← from ${tx.withName}` : `→ to ${tx.withName}`}
                    </span>
                    {tx.note && <span className="text-gray-400 ml-1">· {tx.note}</span>}
                  </div>
                  <span className={`font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Game Board ───────────────────────────────────────────────────────────────
function GameBoard({ state, dispatch }) {
  const [activePlayer, setActivePlayer] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const total = state.players.reduce((s, p) => s + p.balance, 0);
  const player = activePlayer != null ? state.players.find((p) => p.id === activePlayer) : null;

  const exportJson = () => JSON.stringify(state, null, 2);
  const handleImport = (text) => {
    try {
      dispatch({ type: "LOAD", state: JSON.parse(text) });
      setShowExport(false);
    } catch { alert("Invalid JSON"); }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Game Board</h2>
          <div className={`text-sm font-semibold ${Math.abs(total) < 1 ? "text-green-500" : "text-orange-500"}`}>
            Net: {total >= 0 ? "+" : ""}{total} {Math.abs(total) < 1 ? "✓ balanced" : "⚠ unbalanced"}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ResetButton dispatch={dispatch} />
          <button
            onClick={() => setShowExport(!showExport)}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            {showExport ? "Close" : "JSON"}
          </button>
          <button
            onClick={() => dispatch({ type: "END_GAME" })}
            className="px-3 py-1.5 bg-indigo-500 text-white text-xs rounded-xl font-semibold hover:bg-indigo-600 transition"
          >
            Settle →
          </button>
        </div>
      </div>

      {showExport && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-xs font-semibold text-gray-500 mb-2">Export / Import State (JSON)</div>
          <textarea
            className="w-full h-32 text-xs border border-gray-200 rounded-xl p-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-200"
            defaultValue={exportJson()}
            onBlur={(e) => handleImport(e.target.value)}
          />
          <div className="text-xs text-gray-400 mt-1">Edit JSON above and click outside to import</div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {state.players.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-[0.99]"
            onClick={() => setActivePlayer(p.id)}
            role="button"
            aria-label={`Open ${p.name} profile`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                {p.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
                <div className="text-xs text-gray-400">{p.transactions.length} txn{p.transactions.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <AmountInput
                value={p.balance}
                onChange={(val) => dispatch({ type: "SET_BALANCE", id: p.id, balance: val })}
              />
            </div>
          </div>
        ))}
      </div>

      {player && (
        <PlayerProfile
          player={player}
          allPlayers={state.players}
          dispatch={dispatch}
          onClose={() => setActivePlayer(null)}
        />
      )}
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ state, dispatch }) {
  const settlements = settleDebts(state.players);
  const sorted = [...state.players].sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-4xl mb-1">🏆</div>
          <h2 className="text-xl font-bold text-gray-800">Game Over</h2>
          <p className="text-gray-400 text-sm">Final balances & settlements</p>
        </div>
        <ResetButton dispatch={dispatch} />
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2">
        <div className="text-sm font-semibold text-gray-600 mb-1">Final Standings</div>
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
            </div>
            <span className={`font-bold text-sm ${p.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {p.balance >= 0 ? "+" : ""}{p.balance}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="text-sm font-semibold text-gray-600 mb-3">💸 Who Pays Whom</div>
        {settlements.length === 0 ? (
          <div className="text-sm text-green-500 text-center py-2">Everyone is balanced! 🎉</div>
        ) : (
          <div className="flex flex-col gap-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
                <span className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 font-semibold">{s.from}</span>
                  <span className="text-gray-400 mx-1">pays</span>
                  <span className="text-green-600 font-semibold">{s.to}</span>
                </span>
                <span className="font-bold text-indigo-600">{s.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => dispatch({ type: "RESET" })}
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl shadow text-base"
      >
        New Game 🃏
      </button>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  usePersist(state, dispatch);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-md mx-auto">
        {state.step === "setup"   && <SetupScreen   state={state} dispatch={dispatch} />}
        {state.step === "names"   && <NamesScreen   state={state} dispatch={dispatch} />}
        {state.step === "game"    && <GameBoard     state={state} dispatch={dispatch} />}
        {state.step === "results" && <ResultsScreen state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
