// src/common/typeorm-logger.ts
import { Logger } from '@nestjs/common';
import {
  Logger as TypeOrmLogger,
  QueryRunner,
} from 'typeorm';

// ✅ ANSI 색상 유틸
const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',

  select: '\x1b[96m', // 밝은 시안
  from: '\x1b[94m',   // 파랑
  join: '\x1b[35m',   // 보라
  on: '\x1b[33m',     // 노랑
  where: '\x1b[91m',  // 연빨강
  and: '\x1b[92m',    // 연초록
  or: '\x1b[93m',     // 연노랑
  group: '\x1b[36m',  // 시안
  order: '\x1b[36m',
  limit: '\x1b[32m',
  value: '\x1b[37m',  // 값(기본 흰색)
};

// ✅ SQL 키워드별 색상 하이라이팅
const highlightSql = (query: string): string => {
  return query
    .replace(/\bSELECT\b/gi, `${color.bold}${color.select}SELECT${color.reset}`)
    .replace(/\bFROM\b/gi, `${color.bold}${color.from}FROM${color.reset}`)
    .replace(/\bINNER JOIN\b/gi, `${color.bold}${color.join}INNER JOIN${color.reset}`)
    .replace(/\bLEFT JOIN\b/gi, `${color.bold}${color.join}LEFT JOIN${color.reset}`)
    .replace(/\bRIGHT JOIN\b/gi, `${color.bold}${color.join}RIGHT JOIN${color.reset}`)
    .replace(/\bJOIN\b/gi, `${color.bold}${color.join}JOIN${color.reset}`)
    .replace(/\bON\b/gi, `${color.bold}${color.on}ON${color.reset}`)
    .replace(/\bWHERE\b/gi, `${color.bold}${color.where}WHERE${color.reset}`)
    .replace(/\bAND\b/gi, `${color.bold}${color.and}AND${color.reset}`)
    .replace(/\bOR\b/gi, `${color.bold}${color.or}OR${color.reset}`)
    .replace(/\bGROUP BY\b/gi, `${color.bold}${color.group}GROUP BY${color.reset}`)
    .replace(/\bORDER BY\b/gi, `${color.bold}${color.order}ORDER BY${color.reset}`)
    .replace(/\bLIMIT\b/gi, `${color.bold}${color.limit}LIMIT${color.reset}`);
};


const formatSqlForLog = (query: string): string => {
  let q = query.replace(/\s+/g, ' ');

  q = q
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\n  FROM')
    .replace(/\bINNER JOIN\b/gi, '\n  INNER JOIN')
    .replace(/\bLEFT JOIN\b/gi, '\n  LEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\n  RIGHT JOIN')
    .replace(/\bJOIN\b/gi, '\n  JOIN')
    .replace(/\bON\b/gi, '\n    ON')
    .replace(/\bWHERE\b/gi, '\n  WHERE')
    .replace(/\bAND\b/gi, '\n    AND')
    .replace(/\bOR\b/gi, '\n    OR')
    .replace(/\bGROUP BY\b/gi, '\n  GROUP BY')
    .replace(/\bORDER BY\b/gi, '\n  ORDER BY')
    .replace(/\bLIMIT\b/gi, '\n  LIMIT');

  q = q.replace(/^\n+/, '');

  // ✅ 여기서 "줄바꿈된 SQL → 키워드 컬러 강조" 적용
  return highlightSql(q);
};


export class TypeOrmCustomLogger implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM');

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const formatted = formatSqlForLog(query);
    const params =
      parameters && parameters.length
        ? `\nParams: ${JSON.stringify(parameters)}`
        : '';

    this.logger.debug(`Query:\n${formatted}${params}`);
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const formatted = formatSqlForLog(query);
    const params =
      parameters && parameters.length
        ? `\nParams: ${JSON.stringify(parameters)}`
        : '';

    this.logger.error(
      `Query Failed:\n${formatted}${params}\nError: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const formatted = formatSqlForLog(query);
    const params =
      parameters && parameters.length
        ? `\nParams: ${JSON.stringify(parameters)}`
        : '';

    this.logger.warn(
      `Slow Query (${time} ms):\n${formatted}${params}`,
    );
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.verbose(`Schema: ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`Migration: ${message}`);
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ) {
    if (level === 'log' || level === 'info') {
      this.logger.log(message);
    } else if (level === 'warn') {
      this.logger.warn(message);
    }
  }
}
