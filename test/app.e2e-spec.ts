import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }))
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  })

  afterAll(async () => {
    await app.close();
  })


  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'egekayra.aymelek11@gmail.com',
      password: '12345678',
    };
    describe('Signup', () => {

      it('should fail with invalid email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            email: 'invalid-email',
          })
          .expectStatus(400)
      });

      it('should fail with empty email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: '12345678',
          })
          .expectStatus(400)
      });

      it('should fail with empty password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'egekayra.aymelek11@gmail.com',
          })
          .expectStatus(400)
      });

      it('should fail with no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      });

      it('should signup', () => {

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      });
    });

    describe('Signin', () => {

      it('should fail with invalid email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            email: 'invalid-email',
          })
          .expectStatus(400)
      });

      it('should fail with empty email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: '12345678',
          })
          .expectStatus(400)
      });

      it('should fail with empty password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'egekayra.aymelek11@gmail.com',
          })
          .expectStatus(400)
      });

      it('should fail with no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      });

      it('should sigin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      });
    });
  });


  describe('User', () => {

    describe('Get me', () => {
      it('should get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
      });
    });
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Ege',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
      });
    });
  });

  describe('Bookmarks', () => {

    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([])
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        link: 'https://nestjs.com/',
        title: 'NestJS',
        description: 'NestJS is a framework for building efficient, scalable Node.js web applications. It uses modern JavaScript, is built with TypeScript and combines elements of OOP (Object Oriented Progamming), FP (Functional Programming), and FRP (Functional Reactive Programming).',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      });
    });

    describe('Get all bookmarks', () => {
      it('should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
      });
    });

    describe('Get one bookmark', () => {
      it('should get a bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'NodeJS',
      };
      it('should patch a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
      });
    });
    describe('Delete bookmark', () => {
      it('should patch a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
      });
    });

    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([])
      });
    });

  });
});