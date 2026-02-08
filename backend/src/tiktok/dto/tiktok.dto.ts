import { IsArray, IsString } from 'class-validator';

export class UpdateTikTokVideosDto {
    @IsArray()
    @IsString({ each: true })
    videos: string[];
}
