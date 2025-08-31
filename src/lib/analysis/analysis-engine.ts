import { FinancialStatement, Company, AnalysisResult, AnalysisType } from '@/lib/types';
import { updateAnalysis } from '@/lib/api/mongodb';
import { getIndustryBenchmarks } from '@/lib/api/supabase';

// Import all analysis modules
import { performVerticalAnalysis } from './financial-ratios';
import { performHorizontalAnalysis } from './horizontal-analysis';
import { calculateAllFinancialRatios } from './ratio-calculations';
// ... import other analysis modules

export async function runAllAnalyses(
  financialStatements: FinancialStatement[],
  company: Company,
  analysisId: string
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];
  let progress = 0;
  
  try {
    // Get industry benchmarks
    const benchmarks = await getIndustryBenchmarks(
      company.sector,
      company.activity,
      company.comparisonLevel
    );
    
    // Update progress
    await updateAnalysisProgress(analysisId, 10, 'جاري جلب معايير الصناعة...');
    
    // Determine which analyses to run
    const analysesToRun = getAnalysesToRun(company.analysisType);
    const totalAnalyses = analysesToRun.length;
    
    // Run each analysis
    for (let i = 0; i < analysesToRun.length; i++) {
      const analysisType = analysesToRun[i];
      progress = Math.round((i + 1) / totalAnalyses * 90) + 10;
      
      await updateAnalysisProgress(
        analysisId, 
        progress, 
        `جاري تنفيذ ${getAnalysisName(analysisType)}...`
      );
      
      try {
        const result = await runSingleAnalysis(
          analysisType,
          financialStatements,
          company,
          benchmarks
        );
        
        results.push(result);
      } catch (error) {
        console.error(`Error in ${analysisType}:`, error);
        // Continue with other analyses even if one fails
      }
    }
    
    // Generate executive summary
    const executiveSummary = await generateExecutiveSummary(results, company);
    
    // Save all results
    await updateAnalysis(analysisId, {
      status: 'completed',
      results: results,
      executiveSummary: executiveSummary,
      completedAt: new Date()
    });
    
    return results;
    
  } catch (error) {
    console.error('Analysis engine error:', error);
    await updateAnalysis(analysisId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

async function runSingleAnalysis(
  analysisType: AnalysisType,
  financialStatements: FinancialStatement[],
  company: Company,
  benchmarks: any
): Promise<AnalysisResult> {
  const analysisMap: { [key: string]: Function } = {
    // Structural Analysis (15 types)
    [AnalysisType.VerticalAnalysis]: performVerticalAnalysis,
    [AnalysisType.HorizontalAnalysis]: performHorizontalAnalysis,
    [AnalysisType.MixedAnalysis]: performMixedAnalysis,
    [AnalysisType.TrendAnalysis]: performTrendAnalysis,
    [AnalysisType.BasicComparative]: performBasicComparative,
    [AnalysisType.ValueAddedAnalysis]: performValueAddedAnalysis,
    [AnalysisType.CommonSizeAnalysis]: performCommonSizeAnalysis,
    [AnalysisType.SimpleTimeSeries]: performSimpleTimeSeries,
    [AnalysisType.RelativeChanges]: performRelativeChanges,
    [AnalysisType.GrowthRates]: performGrowthRates,
    [AnalysisType.BasicVariance]: performBasicVariance,
    [AnalysisType.SimpleDeviation]: performSimpleDeviation,
    [AnalysisType.DifferenceAnalysis]: performDifferenceAnalysis,
    [AnalysisType.ExceptionalItems]: performExceptionalItems,
    [AnalysisType.IndexNumbers]: performIndexNumbers,
    
    // Financial Ratios (30 ratios) - handled as a group
    [AnalysisType.CurrentRatio]: () => calculateAllFinancialRatios(financialStatements, benchmarks),
    
    // Add all other analysis functions...
  };
  
  const analysisFn = analysisMap[analysisType];
  
  if (!analysisFn) {
    throw new Error(`Analysis type ${analysisType} not implemented`);
  }
  
  return await analysisFn(financialStatements, company, benchmarks);
}

function getAnalysesToRun(analysisType: string): AnalysisType[] {
  if (analysisType === 'comprehensive') {
    // Return all 181 analysis types
    return Object.values(AnalysisType);
  } else if (analysisType === 'basic') {
    // Return basic 55 types
    return [
      // Structural Analysis (15)
      AnalysisType.VerticalAnalysis,
      AnalysisType.HorizontalAnalysis,
      AnalysisType.MixedAnalysis,
      AnalysisType.TrendAnalysis,
      AnalysisType.BasicComparative,
      AnalysisType.ValueAddedAnalysis,
      AnalysisType.CommonSizeAnalysis,
      AnalysisType.SimpleTimeSeries,
      AnalysisType.RelativeChanges,
      AnalysisType.GrowthRates,
      AnalysisType.BasicVariance,
      AnalysisType.SimpleDeviation,
      AnalysisType.DifferenceAnalysis,
      AnalysisType.ExceptionalItems,
      AnalysisType.IndexNumbers,
      
      // All 30 Financial Ratios
      Analys
