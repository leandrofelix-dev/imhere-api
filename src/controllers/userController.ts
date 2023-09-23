import { Request, Response } from 'express'
import { prisma } from '../app'
import Log from '../utils/logger'

export async function createUser(req: Request, res: Response) {
  try {
    const data = req.body
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
      profilePicUrl,
      isExternal,
      studentCode,
      course,
      dateOfBirth,
      semesterOfEntry,
    } = data

    if (password !== passwordConfirmation)
      throw new Error('passwords do not match')

    if (!isExternal) {
      if (!semesterOfEntry)
        throw new Error('semester of entry is required to not external user')
      if (!studentCode)
        throw new Error('student code is required to not external user')
      if (!course) throw new Error('course is required to not external user')

      if (studentCode) {
        const alreadyExistStudentCode = await prisma.user.findFirst({
          where: { studentCode },
        })

        if (alreadyExistStudentCode)
          throw new Error('student code already exists')
      }
    }

    const alreadyExistEmail = await prisma.user.findFirst({ where: { email } })
    if (alreadyExistEmail?.email) throw new Error('email already exists')

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        isExternal,
        profilePicUrl,
        studentCode,
        course,
        semesterOfEntry,
        dateOfBirth: new Date(dateOfBirth),
      },
    })
    Log.info(`user created: ${user}`)
    return res.status(201).json({ created: user })
  } catch (err: any) {
    Log.error(`error: ${err.message}`)
    return res.status(400).json({ error: err.message })
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    if (!user) throw new Error('user not found')

    const deletedUser = await prisma.user.delete({ where: { id } })
    Log.info(`user ${id} was be deleted`)
    return res.status(201).json({ deleted: deletedUser })
  } catch (err: any) {
    Log.error(`error: ${err.message}`)
    return res.status(400).json({ error: err.message })
  }
}

export async function editUser(req: Request, res: Response) {
  try {
    const id = req.params.id
    const data = req.body

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) throw new Error('user not found')

    const updatedUser = await prisma.user.update({ where: { id }, data })

    Log.info(`user ${id} was be updated`)
    return res.status(200).json({ updated: updatedUser })
  } catch (err: any) {
    Log.error(`error: ${err.message}`)
    return res.status(400).json({ error: err.message })
  }
}
