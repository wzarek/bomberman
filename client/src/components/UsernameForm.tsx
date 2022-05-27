import { useContext } from 'react'
import { Formik, Field, Form } from 'formik'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthProvider'

interface Values {
    username: string
}

const UsernameForm = () => {
    const initialValues: Values = { username: '' }
    const { setUser } = useContext(AuthContext)
    const navigate = useNavigate()
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={yup.object({
                username: yup.string()
                    .required('Username is required')
                    .min(4, 'Username is too short')
                    .max(24, 'Username is too long')
                })
            }
            onSubmit={ (values, actions) => {
                const valToSend = {...values}
                actions.resetForm()

                const fetchData = async () => {
                    const response = await fetch('http://localhost:3000/api/setUsername', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-type': 'application/json'
                        },
                    body: JSON.stringify(valToSend)
                    })

                    const data = await response.json()
        
                    if (data && data.username) {
                        setUser( { ...data })
                        navigate('/dashboard')
                    }
                }
        
                fetchData()
            }}
        >
        {formik => (
            <Form>
                <label htmlFor="username">username</label>
                <Field type="text" name='username' id='username'/>
                { formik.touched.username && formik.errors.username }
                <button type='submit' disabled={formik.isSubmitting}>submit</button>
            </Form>
        )}
        </Formik>
    )

}

export default UsernameForm