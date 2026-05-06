import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OperationRule {
  rule: string;
  enforceAudit: boolean;
}

export interface AuthorizationRule {
  id: string;
  title: string;
  operations: Record<string, OperationRule>;
}

interface AuthorizationRulesState {
  rules: Record<string, AuthorizationRule>;
}

const initialState: AuthorizationRulesState = {
  rules: {},
};

const authorizationRulesSlice = createSlice({
  name: 'authorizationRules',
  initialState,
  reducers: {
    saveAuthorizationRule: (
      state,
      action: PayloadAction<{ id: string; title: string; operations: Record<string, OperationRule> }>,
    ) => {
      const { id, title, operations } = action.payload;
      state.rules[id] = { id, title, operations };
    },
    updateOperationRule: (
      state,
      action: PayloadAction<{
        ruleId: string;
        operation: string;
        rule: string;
      }>,
    ) => {
      const { ruleId, operation, rule } = action.payload;
      if (state.rules[ruleId]) {
        if (!state.rules[ruleId].operations[operation]) {
          state.rules[ruleId].operations[operation] = { rule: '', enforceAudit: false };
        }
        state.rules[ruleId].operations[operation].rule = rule;
      }
    },
    updateOperationAudit: (
      state,
      action: PayloadAction<{
        ruleId: string;
        operation: string;
        enforceAudit: boolean;
      }>,
    ) => {
      const { ruleId, operation, enforceAudit } = action.payload;
      if (state.rules[ruleId]) {
        if (!state.rules[ruleId].operations[operation]) {
          state.rules[ruleId].operations[operation] = { rule: '', enforceAudit: false };
        }
        state.rules[ruleId].operations[operation].enforceAudit = enforceAudit;
      }
    },
    resetAllRules: (state) => {
      state.rules = {};
    },
  },
});

export const {
  saveAuthorizationRule,
  updateOperationRule,
  updateOperationAudit,
  resetAllRules,
} = authorizationRulesSlice.actions;

export default authorizationRulesSlice.reducer;
