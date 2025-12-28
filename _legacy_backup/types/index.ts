export type ListType = 'standard' | 'advanced';
export type ListRole = 'owner' | 'member';
export type ItemPriority = 'low' | 'med' | 'high';

export interface List {
    id: string;
    created_at: string;
    name: string;
    type: ListType;
    created_by: string;
}

export interface ListMember {
    id: string;
    list_id: string;
    user_id: string;
    role: ListRole;
}

export interface Item {
    id: string;
    list_id: string;
    created_at: string;
    created_by: string;
    label: string;
    is_done: boolean;
    priority?: ItemPriority;
    deadline?: string;
    assigned_to?: string;
}

export interface Comment {
    id: string;
    item_id: string;
    user_id: string;
    content: string;
    created_at: string;
}
