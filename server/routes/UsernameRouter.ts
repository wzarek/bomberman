import express, { Request, Response } from 'express'
const router = express.Router()

import { validateForm } from '../controllers/validateForm'

router.route('/setUsername')
.get((req: Request, res: Response) => {
    if (req.session.user && req.session.user.username) {
        res.json({ hasUsername: true , username: req.session.user.username })
    } else res.json({ hasUsername: false })
})
.post((req: Request, res: Response) => {
    validateForm(req, res)

    req.session.user = {
        username: req.body.username,
        room: ''
    }

    res.json({ hasUsername: true , username: req.session.user.username })
})

export { router }