interface IFacebookResponse {
    id: string,
    name: string,
    email: string,
    picture: {
        data: {
            height: number,
            is_silhouette: boolean,
            url: string,
            width: string
        }
    }
}