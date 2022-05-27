import * as yup from 'yup'
import { Request, Response } from 'express'

const formSchema = yup.object({
    username: yup.string()
        .required('Username is required')
        .min(4, 'Username is too short')
        .max(24, 'Username is too long')
})

const validateForm = (req: Request, res: Response) => {
    const formData = req.body

    formSchema
        .validate(formData)
        .catch((err: { erros: any }) => {
            res.status(422).send()
            console.error(err.erros)
        })
        .then(valid => {
            if (valid) {
                res.status(200).send()
            }
        })
}

export { validateForm }