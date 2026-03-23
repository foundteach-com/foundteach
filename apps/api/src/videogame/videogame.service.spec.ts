import { Test, TestingModule } from '@nestjs/testing';
import { VideogameService } from './videogame.service';

describe('VideogameService', () => {
  let service: VideogameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideogameService],
    }).compile();

    service = module.get<VideogameService>(VideogameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
