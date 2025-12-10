import tsBlankSpace from 'ts-blank-space';
import { format, resolveConfig } from 'prettier';
import { preprocess } from './parse/preprocess';

export async function stripTypes(inputSource: string, filePath: string): Promise<string> {
  let outputSource = '';
  const hasTemplateTags = inputSource.includes('<template>');
  let preprocessed = null;

  if (hasTemplateTags) {
    preprocessed = preprocess(inputSource, filePath);
    inputSource = preprocessed.code;
  }

  outputSource = tsBlankSpace(inputSource);

  if (hasTemplateTags && preprocessed) {
    // must use inputSource to calculate byte offsets
    // because ts-blank-space replaces multi-byte characters with single-byte spaces
    const buffer = Buffer.from(inputSource, 'utf-8');

    for (const template of preprocessed.templates) {
      const { startByte, endByte } = template.range;
      const startChar = buffer.subarray(0, startByte).toString('utf-8').length;
      const endChar = buffer.subarray(0, endByte).toString('utf-8').length;

      outputSource =
        outputSource.slice(0, startChar) +
        '<template>' +
        template.contents +
        '</template>' +
        outputSource.slice(endChar);
    }
  }

  const options = await resolveConfig(filePath);

  outputSource = await format(outputSource, {
    ...options,
    filepath: filePath,
  });

  return outputSource;
}
