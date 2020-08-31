import axios from "axios"
import json from "json"
const url = "https://localhost:5000"

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

const newmelody = (token, title, melody_data) => {
    let data = JSON.stringify({
        token: token,
        title: title,
        melody_data: melody_data
    })
    return post('/post/new', data)
}

const getpost = (id) => {
    return get('/post/' + id)
}

const deletepost = (id, token) => {
    let data = JSON.stringify({
        token: token
    })
    return post('/post/' + id + '/delete', data)
}

const posts = () => {
    return get('/posts')
}