import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Condition {
  conditionOperator: string; // 'and', 'or', 'then' - empty for first condition
  amount: string;
  currency: string;
  selectedClass: string;
  selectedCondition: string;
  selectedOperand: string;
}

export interface AuthorizationRule {
  conditions: Condition[];
  authRuleConstruct: string;
}

export type NonTransactionalRuleStatus = 'draft' | 'saved';

export interface NonTransactionalRule extends AuthorizationRule {
  id: string;
  status: NonTransactionalRuleStatus;
}

export interface CreateAuthRuleState {
  authRuleName: string;
  authRuleDescription: string;
  // Non-transactional create flow supports multiple rule forms (draft + saved)
  nonTransactionalRules: NonTransactionalRule[];
  savedRules: AuthorizationRule[];
  currentRule: {
    conditions: Condition[];
    authRuleConstruct: string;
  };
}

const initialState: CreateAuthRuleState = {
  authRuleName: '',
  authRuleDescription: '',
  nonTransactionalRules: [],
  savedRules: [],
  currentRule: {
    conditions: [
      {
        conditionOperator: '', // First condition has no operator
        amount: '',
        currency: 'USD',
        selectedClass: '',
        selectedCondition: '',
        selectedOperand: '',
      },
    ],
    authRuleConstruct: '',
  },
};

const createAuthRuleSlice = createSlice({
  name: 'createAuthRule',
  initialState,
  reducers: {
    updateAuthRuleName(state, action: PayloadAction<string>) {
      state.authRuleName = action.payload;
    },
    updateAuthRuleDescription(state, action: PayloadAction<string>) {
      state.authRuleDescription = action.payload;
    },

    setNonTransactionalRules(state, action: PayloadAction<NonTransactionalRule[]>) {
      state.nonTransactionalRules = Array.isArray(action.payload) ? action.payload : [];
    },

    initNonTransactionalRules(state, action: PayloadAction<{ id: string }>) {
      state.nonTransactionalRules = [
        {
          id: action.payload.id,
          status: 'draft',
          conditions: [
            {
              conditionOperator: '',
              amount: '',
              currency: 'USD',
              selectedClass: '',
              selectedCondition: '',
              selectedOperand: '',
            },
          ],
          authRuleConstruct: '',
        },
      ];
    },

    addNonTransactionalRule(state, action: PayloadAction<{ id: string }>) {
      state.nonTransactionalRules.push({
        id: action.payload.id,
        status: 'draft',
        conditions: [
          {
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          },
        ],
        authRuleConstruct: '',
      });
    },

    updateNonTransactionalRuleConstruct(
      state,
      action: PayloadAction<{ id: string; value: string }>,
    ) {
      const rule = state.nonTransactionalRules.find((r) => r.id === action.payload.id);
      if (!rule) return;
      rule.authRuleConstruct = action.payload.value;
    },

    saveNonTransactionalRule(state, action: PayloadAction<{ id: string }>) {
      const rule = state.nonTransactionalRules.find((r) => r.id === action.payload.id);
      if (!rule) return;
      rule.status = 'saved';
    },

    loadNonTransactionalRuleForEdit(state, action: PayloadAction<{ id: string }>) {
      const rule = state.nonTransactionalRules.find((r) => r.id === action.payload.id);
      if (!rule) return;
      rule.status = 'draft';
    },

    deleteNonTransactionalRule(state, action: PayloadAction<{ id: string }>) {
      state.nonTransactionalRules = state.nonTransactionalRules.filter(
        (r) => r.id !== action.payload.id,
      );
    },
    updateCondition(
      state,
      action: PayloadAction<{ conditionIndex: number; field: keyof Condition; value: string }>
    ) {
      const { conditionIndex, field, value } = action.payload;
      // Ensure currentRule and conditions array exist
      if (!state.currentRule) {
        state.currentRule = {
          conditions: [{
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          }],
          authRuleConstruct: '',
        };
      }
      if (!state.currentRule.conditions) {
        state.currentRule.conditions = [{
          conditionOperator: '',
          amount: '',
          currency: 'USD',
          selectedClass: '',
          selectedCondition: '',
          selectedOperand: '',
        }];
      }
      // Ensure the condition at the specified index exists
      if (!state.currentRule.conditions[conditionIndex]) {
        // Create the condition if it doesn't exist
        state.currentRule.conditions[conditionIndex] = {
          conditionOperator: conditionIndex === 0 ? '' : '',
          amount: '',
          currency: 'USD',
          selectedClass: '',
          selectedCondition: '',
          selectedOperand: '',
        };
      }
      // Update the field
      state.currentRule.conditions[conditionIndex][field] = value;
    },
    updateAuthRuleConstruct(state, action: PayloadAction<string>) {
      if (!state.currentRule) {
        state.currentRule = {
          conditions: [{
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          }],
          authRuleConstruct: '',
        };
      }
      state.currentRule.authRuleConstruct = action.payload;
    },
    addConditionToCurrentRule(state) {
      // Ensure currentRule and conditions array exist
      if (!state.currentRule) {
        state.currentRule = {
          conditions: [{
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          }],
          authRuleConstruct: '',
        };
      }
      if (!state.currentRule.conditions) {
        state.currentRule.conditions = [{
          conditionOperator: '',
          amount: '',
          currency: 'USD',
          selectedClass: '',
          selectedCondition: '',
          selectedOperand: '',
        }];
      }
      // Add a new condition to the current rule
      state.currentRule.conditions.push({
        conditionOperator: '', // Will be set by user (and/or/then)
        amount: '',
        currency: 'USD',
        selectedClass: '',
        selectedCondition: '',
        selectedOperand: '',
      });
    },
    removeConditionFromCurrentRule(state, action: PayloadAction<number>) {
      // Remove a condition by index (can't remove the first one)
      if (state.currentRule?.conditions && action.payload > 0 && state.currentRule.conditions.length > 1) {
        state.currentRule.conditions.splice(action.payload, 1);
      }
    },
    saveCurrentRule(state) {
      // Ensure currentRule exists
      if (!state.currentRule) {
        return;
      }
      // Save the entire current rule with all its conditions
      const newRule: AuthorizationRule = {
        conditions: [...(state.currentRule.conditions || [])],
        authRuleConstruct: state.currentRule.authRuleConstruct || '',
      };
      state.savedRules.push(newRule);

      // Reset current rule to initial state with one empty condition
      state.currentRule = {
        conditions: [
          {
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          },
        ],
        authRuleConstruct: '',
      };
    },
    removeRule(state, action: PayloadAction<number>) {
      // Remove rule by index
      state.savedRules.splice(action.payload, 1);
    },

    loadRuleForEdit(state, action: PayloadAction<number>) {
      const index = action.payload;
      const rule = state.savedRules?.[index];
      if (!rule) return;

      state.currentRule = {
        conditions:
          Array.isArray(rule.conditions) && rule.conditions.length
            ? [...rule.conditions]
            : [
                {
                  conditionOperator: '',
                  amount: '',
                  currency: 'USD',
                  selectedClass: '',
                  selectedCondition: '',
                  selectedOperand: '',
                },
              ],
        authRuleConstruct: rule.authRuleConstruct || '',
      };

      state.savedRules.splice(index, 1);
    },
    resetCurrentRule(state) {
      // Reset current rule to initial state with one empty condition
      state.currentRule = {
        conditions: [
          {
            conditionOperator: '',
            amount: '',
            currency: 'USD',
            selectedClass: '',
            selectedCondition: '',
            selectedOperand: '',
          },
        ],
        authRuleConstruct: '',
      };
    },
    resetConditionFields(state) {
      // Reset all fields in all conditions but keep the same number of conditions
      if (state.currentRule?.conditions) {
        state.currentRule.conditions = state.currentRule.conditions.map((condition, index) => ({
          conditionOperator: index === 0 ? '' : condition.conditionOperator,
          amount: '',
          currency: 'USD',
          selectedClass: '',
          selectedCondition: '',
          selectedOperand: '',
        }));
      }
      if (state.currentRule) {
        state.currentRule.authRuleConstruct = '';
      }
    },
    resetSingleCondition(state, action: PayloadAction<number>) {
      // Reset a specific condition by index
      const conditionIndex = action.payload;
      if (state.currentRule?.conditions?.[conditionIndex]) {
        state.currentRule.conditions[conditionIndex] = {
          conditionOperator: conditionIndex === 0 ? '' : state.currentRule.conditions[conditionIndex].conditionOperator,
          amount: '',
          currency: 'USD',
          selectedClass: '',
          selectedCondition: '',
          selectedOperand: '',
        };
      }
    },
    resetAuthRule(state) {
      return initialState;
    },
  },
});

export const {
  updateAuthRuleName,
  updateAuthRuleDescription,
  setNonTransactionalRules,
  initNonTransactionalRules,
  addNonTransactionalRule,
  updateNonTransactionalRuleConstruct,
  saveNonTransactionalRule,
  loadNonTransactionalRuleForEdit,
  deleteNonTransactionalRule,
  updateCondition,
  updateAuthRuleConstruct,
  addConditionToCurrentRule,
  removeConditionFromCurrentRule,
  saveCurrentRule,
  removeRule,
  loadRuleForEdit,
  resetCurrentRule,
  resetConditionFields,
  resetSingleCondition,
  resetAuthRule,
} = createAuthRuleSlice.actions;

export default createAuthRuleSlice.reducer;
 