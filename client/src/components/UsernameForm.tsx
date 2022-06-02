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
        <main id='username-set'>
            <h1>Bomberman game</h1>
            <p>Welcome! In order to start, you first need to set up your username</p>
            <Formik
                initialValues={initialValues}
                validationSchema={yup.object({
                    username: yup.string()
                        .required('Username is required')
                        .min(4, 'Username is too short')
                        .max(24, 'Username is too long')
                })
                }
                onSubmit={(values, actions) => {
                    const valToSend = { ...values }
                    actions.resetForm()

                    const fetchData = async () => {
                        const response = await fetch('https://bomberman-server.herokuapp.com/api/setUsername', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify(valToSend)
                        })

                        const data = await response.json()

                        if (data && data.username) {
                            setUser({ ...data })
                            navigate('/dashboard')
                        }
                    }

                    fetchData()
                }}
            >
                {formik => (
                    <Form className='username-set-form'>
                        <label htmlFor="username">username</label>
                        <Field type="text" name='username' id='username' />
                        {formik.touched.username && formik.errors.username && (<span className='username-set-form-error'> {formik.errors.username} </span>)}
                        <button type='submit' disabled={formik.isSubmitting}>submit</button>
                    </Form>
                )}
            </Formik>
        </main>
    )

}

export default UsernameForm