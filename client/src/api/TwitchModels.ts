export interface User {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: Date;
}

export interface BadgeSet {
    set_id: string;
    versions: BadgeVersion[]
}

export interface BadgeVersion {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
}