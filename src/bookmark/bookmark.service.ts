import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            }
        })

        return bookmark;
    }

    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId,
            }
        })
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId,
            }
        })
    }

    async updateBookmark(userId: number, dto: EditBookmarkDto, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            }
        })
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('Access to resource is denied');
        }

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...dto,
            }
        })
    }

    async deleteBookmark(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            }
        })
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('Access to resource is denied');
        }

        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            }
        })
    }
}
