import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { cases } from './cases';
import type { CaseId, HookCase, RunStatus, RunSummary } from './cases/types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { runHookCase } from './runner/runHookCase';

type CaseResult = {
  status: RunStatus;
  error?: string;
  ranAt?: number;
  durationMs?: number;
};

export function App() {
  const [selectedId, setSelectedId] = useState<CaseId>(cases[0]?.id ?? '');
  const selected = useMemo(() => cases.find((c) => c.id === selectedId) ?? null, [selectedId]);

  const [results, setResults] = useState<Record<CaseId, CaseResult>>({});
  const [runAllStatus, setRunAllStatus] = useState<'idle' | 'running'>('idle');

  const summary: RunSummary = useMemo(() => {
    let pass = 0;
    let fail = 0;
    let skipped = 0;
    let idle = 0;

    for (const c of cases) {
      const r = results[c.id]?.status;
      if (r === 'pass') pass += 1;
      else if (r === 'fail') fail += 1;
      else if (r === 'skipped') skipped += 1;
      else idle += 1;
    }

    return { pass, fail, skipped, idle, total: cases.length };
  }, [results]);

  async function runOne(hookCase: HookCase) {
    setResults((prev) => ({
      ...prev,
      [hookCase.id]: { status: 'running', ranAt: Date.now() },
    }));

    const started = performance.now();
    const res = await runHookCase(hookCase);
    const durationMs = Math.round(performance.now() - started);

    setResults((prev) => ({
      ...prev,
      [hookCase.id]: {
        status: res.status,
        error: res.error,
        ranAt: Date.now(),
        durationMs,
      },
    }));
  }

  async function runAll() {
    if (runAllStatus === 'running') return;
    setRunAllStatus('running');

    try {
      for (const c of cases) {
        // keep deterministic order; avoid collisions for storage/timers
        await runOne(c);
      }
    } finally {
      setRunAllStatus('idle');
    }
  }

  return (
    <Box sx={{ p: 2, height: '100vh', boxSizing: 'border-box' }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ flex: 1 }}>
            @cp949/mui-react19 hooks test
          </Typography>

          <Chip
            label={`pass ${summary.pass} / fail ${summary.fail} / skipped ${summary.skipped} / total ${summary.total}`}
            variant="outlined"
          />

          <Button variant="contained" onClick={runAll} disabled={runAllStatus === 'running'}>
            Run all
          </Button>
        </Stack>

        <Divider />

        <Box sx={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 2, flex: 1 }}>
          <Paper variant="outlined" sx={{ overflow: 'auto' }}>
            <List dense disablePadding>
              {cases.map((c) => {
                const r = results[c.id]?.status ?? 'idle';
                const secondary = results[c.id]?.durationMs
                  ? `${r} · ${results[c.id]?.durationMs}ms`
                  : r;

                return (
                  <ListItemButton
                    key={c.id}
                    selected={c.id === selectedId}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <ListItemText primary={c.name} secondary={secondary} />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, overflow: 'auto' }}>
            {selected ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {selected.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={results[selected.id]?.status ?? 'idle'}
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => runOne(selected)}
                    disabled={results[selected.id]?.status === 'running'}
                  >
                    Run
                  </Button>
                </Stack>

                {selected.description ? (
                  <Typography variant="body2" color="text.secondary">
                    {selected.description}
                  </Typography>
                ) : null}

                {results[selected.id]?.status === 'fail' ? (
                  <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
                    {results[selected.id]?.error ?? 'Unknown error'}
                  </Alert>
                ) : null}

                {selected.tags?.length ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selected.tags.map((t) => (
                      <Chip key={t} size="small" label={t} variant="outlined" />
                    ))}
                  </Stack>
                ) : null}

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview
                  </Typography>
                  <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider' }}>
                    <ErrorBoundary
                      fallback={(error) => (
                        <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
                          {error instanceof Error
                            ? `${error.name}: ${error.message}`
                            : String(error)}
                        </Alert>
                      )}
                    >
                      <selected.Preview />
                    </ErrorBoundary>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Typography color="text.secondary">No cases</Typography>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
