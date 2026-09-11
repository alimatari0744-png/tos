import { getStore, mutateStore } from "@/lib/store.functions";

type Filter = { col: string; val: unknown };

function createFrom(table: string) {
  const state = {
    filters: [] as Filter[],
    order: null as { col: string; asc: boolean } | null,
    single: false,
    limit: undefined as number | undefined,
  };

  const selectResult: {
    select: (cols?: string) => typeof selectResult;
    eq: (col: string, val: unknown) => typeof selectResult;
    order: (col: string, opts?: { ascending?: boolean }) => typeof selectResult;
    maybeSingle: () => typeof selectResult;
    limit: (n: number) => typeof selectResult;
    then: PromiseLike<{ data: any; error: null }>["then"];
  } = {
    select() {
      return selectResult;
    },
    eq(col, val) {
      state.filters.push({ col, val });
      return selectResult;
    },
    order(col, opts) {
      state.order = { col, asc: opts?.ascending !== false };
      return selectResult;
    },
    maybeSingle() {
      state.single = true;
      return selectResult;
    },
    limit(n) {
      state.limit = n;
      return selectResult;
    },
    then(resolve, reject) {
      const run = getStore().then((store) => {
        let rows = [...(((store as Record<string, any[]>)[table] as Record<string, any>[]) ?? [])];
        for (const f of state.filters) {
          rows = rows.filter((r) => r[f.col] === f.val);
        }
        if (state.order) {
          const { col, asc } = state.order;
          rows.sort((a, b) => {
            const av = a[col];
            const bv = b[col];
            if (av == bv) return 0;
            const cmp = (av as string | number) > (bv as string | number) ? 1 : -1;
            return asc ? cmp : -cmp;
          });
        }
        if (state.limit != null) rows = rows.slice(0, state.limit);
        if (state.single) return { data: rows[0] ?? null, error: null };
        return { data: rows, error: null };
      });
      return run.then(resolve, reject);
    },
  };

  return {
    select: selectResult.select.bind(selectResult),
    insert: async (row: any) => {
      try {
        const rows = Array.isArray(row) ? row : [row];
        await mutateStore({ data: { op: "insert", table, rows } });
        return { error: null };
      } catch (e) {
        return { error: { message: e instanceof Error ? e.message : "insert failed" } };
      }
    },
    update: (patch: any) => ({
      eq: async (col: string, val: unknown) => {
        try {
          await mutateStore({ data: { op: "update", table, patch, match: { [col]: val } } });
          return { error: null };
        } catch (e) {
          return { error: { message: e instanceof Error ? e.message : "update failed" } };
        }
      },
    }),
    delete: () => ({
      eq: async (col: string, val: unknown) => {
        try {
          await mutateStore({ data: { op: "delete", table, match: { [col]: val } } });
          return { error: null };
        } catch (e) {
          return { error: { message: e instanceof Error ? e.message : "delete failed" } };
        }
      },
    }),
  };
}

export const localDb = {
  from: createFrom,
};
