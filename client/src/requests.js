import axios from "axios"

const url = "http://54.161.220.66";


const post = (path, data) => {
    return axios.post(url + path, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    ).catch(console.log)
}

const get = (path) => {
    return axios.get(url + path).catch(console.log)
}

const register = (name, password) => {
    let data = JSON.stringify({
        name: name,
        password: password,
    })
    return post('/register', data)
}

const login = (name, password) => {
    let data = JSON.stringify({
        name: name,
        password: password,
    })
    return post('/login', data)
}

const account = (token) => {
    let data = JSON.stringify({
        token: token
    })
    return post('/account', data)
}

const user = (name) => {
    return get('/user/' + name)
}

const newMelody = (token, title, melody_data) => {
    let data = JSON.stringify({
        token: token,
        title: title,
        melody_data: melody_data
    })
    return post('/post/new', data)
}

const getPost = (id) => {
    return get('/post/' + id)
}

const deletePost = (id, token) => {
    let data = JSON.stringify({
        token: token
    })
    return post('/post/' + id + '/delete', data)
}

const allPosts = () => {
    return get('/posts')
}

export { register, login, account, user, newMelody, getPost, deletePost, allPosts };