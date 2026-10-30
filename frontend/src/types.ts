export interface BlogAuthor {
    name: string;
}

export interface Blog {
    id: string;
    title: string;
    content: string;
    tags: string[];
    time: string;
    updatedAt: string;
    authorId: string;
    author: BlogAuthor;
}

export interface BlogPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface BlogFeedResponse {
    blogs: Blog[];
    pagination: BlogPagination;
}

export interface AuthUser {
    id: string;
    name: string;
}
