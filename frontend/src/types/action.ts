/**
 * Frontend Action Types
 */

export interface ActionParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date';
  required?: boolean;
  default?: string | number | boolean;
}

export interface ActionLink {
  label: string;
  href: string;
  parameters?: ActionParameter[];
}

export interface ActionLinks {
  actions: ActionLink[];
  [key: string]: any;
}

export interface ContractInfo {
  address: string;
  timeout: number;
  status: 'active' | 'expired';
  txid: string;
}

export interface BlinchActionMetadata {
  protocol: string;
  identifier: string;
  hex_prefix: string;
  contract_info?: ContractInfo;
}

export interface BlinchAction {
  version: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  links: ActionLinks;
  metadata: BlinchActionMetadata;
}

export interface ActionResponse {
  action?: BlinchAction;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
