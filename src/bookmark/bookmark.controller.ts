import { Controller, UseGuards, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guards';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) { }

    @Post()
    createBookmark(@GetUser('id') userId: number, @Body() dto: CreateBookmarkDto) {
        return this.bookmarkService.createBookmark(userId, dto)
    }

    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId)
    }

    @Get(':id')
    getBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId)
    }

    @Patch(':id')
    updateBookmark(@GetUser('id') userId: number, @Body() dto: EditBookmarkDto, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.updateBookmark(userId, dto, bookmarkId)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmark(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.deleteBookmark(userId, bookmarkId)
    }

}
